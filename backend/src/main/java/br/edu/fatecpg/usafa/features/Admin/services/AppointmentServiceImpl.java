package br.edu.fatecpg.usafa.features.Admin.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.Admin.utils.appointment.AppointmentHelper;
import br.edu.fatecpg.usafa.features.Admin.utils.appointment.AppointmentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.repository.IConsultaRepository;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentServiceImpl implements IAppointmentService {

    // Dependências principais
    private final IConsultaRepository consultaRepository;
    private final ICacheService cacheService;

    // Dependências auxiliares (NOVAS)
    private final AppointmentHelper helper;
    private final AppointmentMapper mapper;

    private static final String CACHE_KEY_ALL_APPOINTMENTS = "appointments:all";

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAllAppointments() {
        log.info("Buscando todas as consultas");

        // 1. Tentar buscar do cache
        try {
            @SuppressWarnings("unchecked")
            List<AppointmentResponseDto> cachedAppointments = cacheService.get(CACHE_KEY_ALL_APPOINTMENTS, List.class);
            if (cachedAppointments != null) {
                log.info("Retornando {} consultas do cache", cachedAppointments.size());
                return cachedAppointments;
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar do cache: {}", e.getMessage());
        }

        try {
            // 2. Buscar do banco (se o cache falhar)
            log.info("Cache miss. Buscando do banco de dados...");
            List<Consulta> consultas = consultaRepository.findAll();
            
            // 3. Mapear para DTO (usando o Mapper)
            List<AppointmentResponseDto> dtos = consultas.stream()
                    .map(mapper::toDto) // <-- MUITO MAIS LIMPO!
                    .collect(Collectors.toList());

            // 4. Salvar no cache
            cacheService.saveWithTtl(CACHE_KEY_ALL_APPOINTMENTS, dtos, 10, TimeUnit.MINUTES);
            return dtos;

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar consultas: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao buscar consultas", e);
        }
    }

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto appointmentDto) {
        log.info("Criando nova consulta para paciente {}", appointmentDto.getPatientId());

        // 1. Validar e buscar (delegado ao Helper)
        User patient = helper.findPatientByPublicId(appointmentDto.getPatientId());
        Medico doctor = helper.findDoctorByPublicId(appointmentDto.getDoctorId());
        LocalDateTime dateTime = helper.parseDateTime(appointmentDto.getDateTime());
        ConsultaStatus status = helper.parseStatus(appointmentDto.getStatus());
        
        // 2. Regras de Negócio (delegado ao Helper)
        helper.validateAppointmentSlot(doctor, dateTime.toLocalDate(), dateTime.toLocalTime());

        // 3. Mapear DTO para Entidade
        Consulta consulta = new Consulta();
        consulta.setUser(patient);
        consulta.setMedico(doctor);
        consulta.setDia(dateTime.toLocalDate());
        consulta.setHorario(dateTime.toLocalTime());
        consulta.setStatus(status);
        
        try {
            // 4. Salvar
            Consulta savedConsulta = consultaRepository.save(consulta);
            log.info("Consulta criada com ID: {}", savedConsulta.getPublicId());

            // 5. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);

            // 6. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(savedConsulta);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao salvar consulta: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao salvar consulta", e);
        }
    }

    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto) {
        log.info("Atualizando consulta ID: {}", id);

        // 1. Buscar a consulta existente (delegado ao Helper)
        Consulta consulta = helper.findConsultaByPublicId(id);

        // 2. Validar e buscar dados (delegado ao Helper)
        User patient = helper.findPatientByPublicId(appointmentDto.getPatientId());
        Medico doctor = helper.findDoctorByPublicId(appointmentDto.getDoctorId());
        LocalDateTime dateTime = helper.parseDateTime(appointmentDto.getDateTime());
        ConsultaStatus status = helper.parseStatus(appointmentDto.getStatus());
        
        // 3. Regra de Negócio (delegado ao Helper)
        if (!consulta.getDia().equals(dateTime.toLocalDate()) || !consulta.getHorario().equals(dateTime.toLocalTime())) {
            helper.validateAppointmentSlot(doctor, dateTime.toLocalDate(), dateTime.toLocalTime());
        }

        // 4. Atualizar a entidade
        consulta.setUser(patient);
        consulta.setMedico(doctor);
        consulta.setDia(dateTime.toLocalDate());
        consulta.setHorario(dateTime.toLocalTime());
        consulta.setStatus(status);
        
        try {
            // 5. Salvar
            Consulta updatedConsulta = consultaRepository.save(consulta);
            
            // 6. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);

            // 7. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(updatedConsulta);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao atualizar consulta: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao atualizar consulta", e);
        }
    }

    @Override
    @Transactional
    public void deleteAppointment(String id) {
        log.info("Deletando consulta ID: {}", id);
        
        // 1. Validar existência (delegado ao Helper)
        helper.validateAppointmentExists(id);
        
        try {
            // 2. Deletar
            consultaRepository.deleteByPublicId(id); 

            // 3. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);
            log.info("Consulta ID {} deletada e cache invalidado", id);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao deletar consulta: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao deletar consulta", e);
        }
    }
}
