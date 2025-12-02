package br.edu.fatecpg.usafa.features.admin.services.Appointment;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMigrationService;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.repositories.ISolicitacaoConsultaRepository;
import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.exceptions.MongoConnectionException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import com.mongodb.MongoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentConsumerServiceImpl implements IAppointmentConsumerService {

    // [MUDANÇA] Repositório SQL substitui o Mongo
    private final ISolicitacaoConsultaRepository sqlRepository;
    private final ICacheService cacheService;
    private final AppointmentMigrationService migrationService;

    private static final String CACHE_KEY_REQUESTS = "appointment:requests:all";

    @Override
    public Page<RequestAppointmentResponseDto> getAllConsultaRequests(String search, String status, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();

        Page<SolicitacaoConsulta> pageEntities;

        try {
            // [MUDANÇA] Lógica adaptada para JPA/SQL
            // Assumindo que 'search' é o PublicID do usuário. Convertemos String -> UUID.
            UUID userUuid = hasSearch ? UUID.fromString(search) : null;

            if (hasSearch && hasStatus) {
                pageEntities = sqlRepository.findByUser_PublicIdAndStatus(userUuid, status, pageable);
            } else if (hasSearch) {
                pageEntities = sqlRepository.findByUser_PublicId(userUuid, pageable);
            } else if (hasStatus) {
                pageEntities = sqlRepository.findByStatus(status, pageable);
            } else {
                pageEntities = sqlRepository.findAll(pageable);
            }
        } catch (IllegalArgumentException e) {
             // Caso a string de busca não seja um UUID válido
            log.warn("Formato de ID inválido na busca: {}", search);
            return Page.empty();
        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar solicitações: {}", e.getMessage(), e);
            throw new DatabaseOperationException("Erro ao buscar solicitações de agendamento.", e);
        }

        // 2. Converte Entidade SQL -> DTO
        return pageEntities.map(this::toDto);
    }

    @Override
    @Transactional
    public RequestAppointmentResponseDto updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto) {
        log.info("Processando atualização ID SQL: {}", consultaId);
        try {
            // [MUDANÇA] Busca no SQL pelo ID (Convertendo String para Long se necessário)
            Long id = Long.parseLong(consultaId);
            
            SolicitacaoConsulta entity = sqlRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Solicitação não encontrada com o ID: " + consultaId));

            LocalDate dtoDia = LocalDate.parse(dto.dia());
            LocalTime dtoHorario = LocalTime.parse(dto.horario());
            String dtoStatus = dto.status().toUpperCase();

            // Verifica idempotência
            if (migrationService.isSameStatusAndDate(entity, dtoStatus, dtoDia, dtoHorario)) {
                return toDto(entity);
            }

            SolicitacaoConsulta updatedEntity;
            
            // Lógica de decisão
            if ("ACEITA".equals(dtoStatus)) {
                // [MUDANÇA] Promove a Solicitação SQL para uma Consulta Confirmada
                updatedEntity = migrationService.processarAceite(entity, dtoDia, dtoHorario);
            } else {
                // Apenas atualiza o rascunho na tabela de solicitações
                updatedEntity = migrationService.atualizarSolicitacao(entity, dtoDia, dtoHorario, dtoStatus);
            }

            cacheService.delete(CACHE_KEY_REQUESTS);
            return toDto(updatedEntity);

        } catch (NumberFormatException e) {
             throw new BusinessRuleException("ID da solicitação inválido formatado.");
        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao atualizar status: {}", consultaId, e);
            throw new DatabaseOperationException("Erro ao processar a atualização da solicitação.", e);
        }
    }

    // [MUDANÇA] Delete no SQL
    @Override
    public void deleteConsultaRequest(String consultaId) {
        try {
            Long id = Long.parseLong(consultaId);
            if (!sqlRepository.existsById(id)) {
                throw new NotFoundException("Solicitação não encontrada para exclusão com o ID: " + consultaId);
            }
            sqlRepository.deleteById(id);
            cacheService.delete(CACHE_KEY_REQUESTS);
        } catch (DataAccessException e) {
            log.error("Erro ao deletar solicitação SQL: {}", consultaId, e);
            throw new DatabaseOperationException("Erro ao deletar a solicitação.", e);
        }
    }

    // --- Mapper SQL para DTO ---
    private RequestAppointmentResponseDto toDto(SolicitacaoConsulta entity) {
        return RequestAppointmentResponseDto.builder()
                .id(entity.getId().toString()) // Long -> String
                .sintomas(entity.getSintomas())
                .dia(entity.getDia())
                .horario(entity.getHorario())
                .status(entity.getStatus())
                // Navegação via relacionamentos JPA
                .userPublicId(entity.getUser().getPublicId().toString())
                .medicoPublicId(entity.getMedico().getPublicId())
                .tipoConsultaPublicId(entity.getTipoConsulta().getPublicId())
                .patientName(entity.getUser().getName())
                .doctorName(entity.getMedico().getNome())
                .appointmentTypeName(entity.getTipoConsulta().getNome())
                .build();
    }
}