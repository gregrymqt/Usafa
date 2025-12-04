package br.edu.fatecpg.usafa.features.consulta.services;


import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMigrationService;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
import br.edu.fatecpg.usafa.features.consulta.dtos.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentRequestService;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaConsumerHelper;
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
    private final INotificationService notificationService;
    private final ObjectMapper objectMapper;
    
    // Helpers
    private final ConsultaConsumerHelper helper;
    private final PageCacheHelper pageCacheHelper;
    private final AppointmentMigrationService migrationService;

    // --- CONSUMER (CRIAÇÃO VIA REDIS) ---

    public void receiveMessage(String messageJson) {
        processarSolicitacaoAsync(messageJson);
    }

    @Async
    @Transactional
    public void processarSolicitacaoAsync(String messageJson) {
        AppointmentRequestDto request = null;
        try {
            request = objectMapper.readValue(messageJson, AppointmentRequestDto.class);
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

            // Invalida cache do usuário
            invalidateRequestCaches(user.getPublicId().toString());

            // Notifica
            RequestAppointmentResponseDto responseDto = helper.mapToDto(saved);
            notificationService.send(
                request.getPatientId(), "SOLICITACAO_RECEBIDA", 
                "Recebemos seu pedido!", responseDto, "/queue/consultas"
            );

        } catch (Exception e) {
            log.error("Erro ao processar solicitação: {}", e.getMessage());
            if (request != null) {
                notificationService.send(
                    request.getPatientId(), "SOLICITACAO_FALHOU", "Erro: " + e.getMessage(), null, "/queue/consultas"
                );
            }
        }
    }

    // --- LEITURA (PUBLIC & ADMIN UNIFICADOS) ---

    /**
     * Busca solicitações.
     * Se passar userPublicId -> Filtra por usuário (Visão Paciente).
     * Se passar search/status e for Admin -> Filtra globalmente (Visão Admin).
     */
    @Transactional(readOnly = true)
    public Page<RequestAppointmentResponseDto> getRequests(String userPublicId, String status, Pageable pageable) {
        
        // Define a chave de cache baseada nos filtros
        String safeUser = (userPublicId != null) ? userPublicId : "ALL_USERS";
        String safeStatus = (status != null && !status.isEmpty()) ? status : "ALL_STATUS";
        
        String cacheKey = String.format("REQUESTS:%s:%s:%d:%d", 
                safeUser, safeStatus, pageable.getPageNumber(), pageable.getPageSize());

        return pageCacheHelper.getPageFromCacheOrDb(
            cacheKey,
            RequestAppointmentResponseDto.class,
            () -> {
                // Lógica de decisão SQL
                UUID userUuid = (userPublicId != null) ? UUID.fromString(userPublicId) : null;
                
                if (userUuid != null && !"ALL_STATUS".equals(safeStatus)) {
                    return sqlRepository.findByUser_PublicIdAndStatus(userUuid, status, pageable);
                } else if (userUuid != null) {
                    return sqlRepository.findByUser_PublicId(userUuid, pageable);
                } else if (!"ALL_STATUS".equals(safeStatus)) {
                    return sqlRepository.findByStatus(status, pageable);
                } else {
                    return sqlRepository.findAll(pageable);
                }
            },
            helper::mapToDto,
            5, TimeUnit.MINUTES
        );
    }

    // --- ESCRITA (ADMIN) ---

    @Transactional
    public RequestAppointmentResponseDto updateStatus(String idStr, UpdateAppointmentDTO dto) {
        Long id = Long.parseLong(idStr);
        SolicitacaoConsulta entity = sqlRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

        LocalDate dia = LocalDate.parse(dto.dia());
        LocalTime hora = LocalTime.parse(dto.horario());
        String status = dto.status().toUpperCase();

        if (migrationService.isSameStatusAndDate(entity, status, dia, hora)) {
            return helper.mapToDto(entity);
        }

        SolicitacaoConsulta updated;
        if ("ACEITA".equals(status)) {
            // Migra para tabela de Consultas Confirmadas
            updated = migrationService.processarAceite(entity, dia, hora);
        } else {
            updated = migrationService.atualizarSolicitacao(entity, dia, hora, status);
        }

        invalidateRequestCaches(entity.getUser().getPublicId().toString());
        return helper.mapToDto(updated);
    }

    @Transactional
    public void deleteRequest(String idStr) {
        Long id = Long.parseLong(idStr);
        SolicitacaoConsulta entity = sqlRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));
        
        sqlRepository.delete(entity);
        invalidateRequestCaches(entity.getUser().getPublicId().toString());
    }

    private void invalidateRequestCaches(String userId) {
         cacheService.deletePattern("REQUESTS:" + userId + "*");
         cacheService.deletePattern("REQUESTS:ALL_USERS*");
    }
}