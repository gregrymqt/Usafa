package br.edu.fatecpg.usafa.features.admin.services.Appointment;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMigrationService;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
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

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentConsumerServiceImpl implements IAppointmentConsumerService {

    private final IConsultaDocumentRepository mongoRepository;
    private final ICacheService cacheService;
    private final AppointmentMigrationService migrationService;

    private static final String CACHE_KEY_REQUESTS = "appointment:requests:all";

    @Override
    public Page<RequestAppointmentResponseDto> getAllConsultaRequests(String search, String status, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();

        Page<RequestAppointment> pageEntities;

        try {
            // 1. Busca as Entidades no Banco (MongoDB)
            if (hasSearch && hasStatus) {
                pageEntities = mongoRepository.findByUserPublicIdAndStatus(search, status, pageable);
            } else if (hasSearch) {
                pageEntities = mongoRepository.findByUserPublicId(search, pageable);
            } else if (hasStatus) {
                pageEntities = mongoRepository.findByStatus(status, pageable);
            } else {
                pageEntities = mongoRepository.findAll(pageable);
            }
        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao buscar solicitações de agendamento.", e);
                throw new MongoConnectionException("Falha de comunicação com o banco de dados ao buscar solicitações.",
                        e);
            } else {
                log.error("Erro de banco de dados ao buscar solicitações de agendamento: {}", e.getMessage(), e);
                throw new DatabaseOperationException("Erro ao buscar solicitações de agendamento.", e);
            }
        }

        // 2. Converte (Mapeia) de Entidade -> DTO
        return pageEntities.map(this::toDto);
    }

    @Override
    public RequestAppointmentResponseDto updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto) {
        log.info("Processando atualização ID: {}", consultaId);

        try {
            RequestAppointment doc = mongoRepository.findById(consultaId)
                    .orElseThrow(() -> new NotFoundException("Solicitação não encontrada com o ID: " + consultaId));

            LocalDate dtoDia = LocalDate.parse(dto.dia());
            LocalTime dtoHorario = LocalTime.parse(dto.horario());
            String dtoStatus = dto.status().toUpperCase();

            // Verifica idempotência (se já foi processado igual)
            if (migrationService.isSameStatusAndDate(doc, dtoStatus, dtoDia, dtoHorario)) {
                return toDto(doc);
            }

            RequestAppointment resultDoc;

            // Lógica de decisão (Migrar ou Atualizar Rascunho)
            if ("ACEITA".equals(dtoStatus)) {
                resultDoc = migrationService.migrarParaSql(doc, dtoDia, dtoHorario);
            } else {
                resultDoc = migrationService.atualizarRascunhoMongo(doc, dtoDia, dtoHorario, dtoStatus);
            }

            cacheService.delete(CACHE_KEY_REQUESTS);

            // Retorna o objeto convertido para DTO
            return toDto(resultDoc);

        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao atualizar status da solicitação: {}", consultaId, e);
                throw new MongoConnectionException(
                        "Falha de comunicação com o banco de dados ao atualizar a solicitação.", e);
            } else {
                log.error("Erro de banco de dados ao atualizar status da solicitação: {}", consultaId, e);
                throw new DatabaseOperationException("Erro ao processar a atualização da solicitação.", e);
            }
        }
    }

    // --- Método Auxiliar de Conversão (Mapper) ---
    private RequestAppointmentResponseDto toDto(RequestAppointment entity) {
        return RequestAppointmentResponseDto.builder()
                .id(entity.getId())
                .sintomas(entity.getSintomas())
                .dia(entity.getDia())
                .horario(entity.getHorario())
                .status(entity.getStatus())
                .userPublicId(entity.getUserPublicId())
                .medicoPublicId(entity.getMedicoPublicId())
                .tipoConsultaPublicId(entity.getTipoConsultaPublicId())
                .patientName(entity.getPatientName())
                .doctorName(entity.getDoctorName())
                .appointmentTypeName(entity.getAppointmentTypeName())
                .build();
    }

    // Método delete mantém igual pois retorna void
    @Override
    public void deleteConsultaRequest(String consultaId) {
        try {
            if (!mongoRepository.existsById(consultaId)) {
                throw new NotFoundException("Solicitação não encontrada para exclusão com o ID: " + consultaId);
            }
            mongoRepository.deleteById(consultaId);
            cacheService.delete(CACHE_KEY_REQUESTS);
        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao deletar solicitação: {}", consultaId, e);
                throw new MongoConnectionException(
                        "Falha de comunicação com o banco de dados ao deletar a solicitação.", e);
            } else {
                log.error("Erro de banco de dados ao deletar solicitação: {}", consultaId, e);
                throw new DatabaseOperationException("Erro ao deletar a solicitação.", e);
            }
        }
    }
}