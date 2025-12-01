package br.edu.fatecpg.usafa.features.admin.services.Appointment;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentConsumerService;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMigrationService;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaDocumentRepository;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;

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

        Page<RequestAppointment> pageEntities; // Variável para armazenar as entidades

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

        // 2. Converte (Mapeia) de Entidade -> DTO
        return pageEntities.map(this::toDto);
    }

    @Override
    public RequestAppointmentResponseDto updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto) {
        log.info("Processando atualização ID: {}", consultaId);
        
        RequestAppointment doc = mongoRepository.findById(consultaId)
                .orElseThrow(() -> new BusinessRuleException("Solicitação não encontrada")); 

        LocalDate dtoDia = LocalDate.parse(dto.dia());
        LocalTime dtoHorario = LocalTime.parse(dto.horario());
        String dtoStatus = dto.status().toUpperCase(); 

        // Verifica idempotência (se já foi processado igual)
        if (migrationService.isSameStatusAndDate(doc, dtoStatus, dtoDia, dtoHorario)) { // [cite: 30]
            return toDto(doc); // Retorna DTO
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
        if (!mongoRepository.existsById(consultaId)) {
            throw new BusinessRuleException("Solicitação não encontrada"); 
        }
        mongoRepository.deleteById(consultaId);
        cacheService.delete(CACHE_KEY_REQUESTS); // [cite: 43]
    }
}