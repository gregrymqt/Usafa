package br.edu.fatecpg.usafa.features.consulta.services;


import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentRequestService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.AppointmentConsumerHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.AppointmentMigrationService;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentRequestService implements IAppointmentRequestService {

    private final ISolicitacaoConsultaRepository sqlRepository;
    private final ICacheService cacheService;
    // NotificationService Removido
    private final ObjectMapper objectMapper;
    
    private final AppointmentConsumerHelper helper;
    private final PageCacheHelper pageCacheHelper;
    private final AppointmentMigrationService migrationService;
    
    // --- CONSUMER ---
    public void receiveMessage(String messageJson) {
        processarSolicitacaoAsync(messageJson);
    }

    @Async
    @Transactional
    public void processarSolicitacaoAsync(String messageJson) {
        AppointmentOperationDTO request = null;
        try {
            request = objectMapper.readValue(messageJson, AppointmentOperationDTO.class);
            log.info("Processando solicitação para usuário: {}", request.getPatientId());

            User user = helper.findUserOrThrow(request.getPatientId());
            HorarioSlot slot = helper.findSlotOrThrow(request.getHorarioSlotId());
            TipoConsulta tipo = helper.findTipoConsultaOrThrow(request.getTipoConsultaId());

            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("Médico incompatível.");
            }
            helper.validateSlotAvailability(slot);

            SolicitacaoConsulta entity = helper.createEntityFromSlot(request, user, slot, tipo);
            SolicitacaoConsulta saved = sqlRepository.save(entity);

            invalidateRequestCaches(user.getPublicId().toString());

            // Notificação removida. Apenas logamos o sucesso.
            log.info("Solicitação criada com sucesso para o usuário {}", user.getPublicId());

        } catch (Exception e) {
            log.error("Erro ao processar solicitação: {}", e.getMessage());
            // Notificação de falha removida.
        }
    }

    // --- LEITURA ---

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentAdminResponseDTO> getAllRequestsAdmin(String status, Pageable pageable) {
        String safeStatus = (status != null && !status.isEmpty()) ? status : "ALL_STATUS";
        String cacheKey = String.format("REQUESTS:ADMIN:%s:%d:%d", safeStatus, pageable.getPageNumber(), pageable.getPageSize());

        return pageCacheHelper.getPageFromCacheOrDb(
            cacheKey,
            AppointmentAdminResponseDTO.class,
            () -> {
                if (!"ALL_STATUS".equals(safeStatus)) {
                    return sqlRepository.findByStatus(status, pageable);
                } else {
                    return sqlRepository.findAll(pageable);
                }
            },
            helper::mapToAdminDto,
            5, TimeUnit.MINUTES
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentUserResponseDTO> getRequestsByUser(String userPublicId, Pageable pageable) {
        String cacheKey = String.format("REQUESTS:USER:%s:%d:%d", userPublicId, pageable.getPageNumber(), pageable.getPageSize());

        return pageCacheHelper.getPageFromCacheOrDb(
            cacheKey,
            AppointmentUserResponseDTO.class,
            () -> {
                UUID userUuid = UUID.fromString(userPublicId);
                return sqlRepository.findByUser_PublicId(userUuid, pageable);
            },
            helper::mapToUserDto,
            5, TimeUnit.MINUTES
        );
    }

    // --- ESCRITA ---

    @Override
    @Transactional
    public AppointmentAdminResponseDTO updateStatus(String idStr, AppointmentOperationDTO dto) {
        SolicitacaoConsulta entity;
        try {
             entity = sqlRepository.findByPublicId(UUID.fromString(idStr))
                     .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        } catch (IllegalArgumentException e) {
             entity = sqlRepository.findById(Long.parseLong(idStr))
                     .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        }

        String newStatus = dto.getStatus().toUpperCase();
        
        SolicitacaoConsulta updated;
        if ("ACEITA".equals(newStatus)) {
            updated = migrationService.processarAceite(entity);
        } else {
            updated = migrationService.atualizarSolicitacao(entity, newStatus);
        }

        invalidateRequestCaches(entity.getUser().getPublicId().toString());
        return helper.mapToAdminDto(updated);
    }

    @Override
    @Transactional
    public void deleteRequest(String idStr) {
        SolicitacaoConsulta entity;
        try {
             entity = sqlRepository.findByPublicId(UUID.fromString(idStr))
                     .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        } catch (IllegalArgumentException e) {
             entity = sqlRepository.findById(Long.parseLong(idStr))
                     .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        }
        
        sqlRepository.delete(entity);
        invalidateRequestCaches(entity.getUser().getPublicId().toString());
    }

    private void invalidateRequestCaches(String userId) {
         cacheService.deletePattern("REQUESTS:USER:" + userId + "*");
         cacheService.deletePattern("REQUESTS:ADMIN:*");
    }
}