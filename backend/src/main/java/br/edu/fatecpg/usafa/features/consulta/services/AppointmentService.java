package br.edu.fatecpg.usafa.features.consulta.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.FormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.AppointmentConsumerHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.AppointmentHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.AppointmentMapper;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService implements IAppointmentService {

    private final IConsultaRepository consultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;
    
    private final AppointmentConsumerHelper consumerHelper; 
    private final ICacheService cacheService;
    private final PageCacheHelper pageCacheHelper;
    private final AppointmentHelper helper; 
    private final AppointmentMapper appointmentMapper;
    
    // --- LEITURA ---

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentUserResponseDTO> findConsultasByUser(User user, Pageable pageable) {
        // Verifica se o helper tem o método getConsultasCacheKey. 
        // Se der erro aqui, verifique o arquivo AppointmentHelper.java
        String cacheKey = helper.getConsultasCacheKey(
                user.getPublicId().toString() + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize());

        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                AppointmentUserResponseDTO.class,
                () -> consultaRepository.findByUser(user, pageable),
                // CORREÇÃO: Lambda explícito ajuda o compilador a entender o tipo
                consulta -> appointmentMapper.toUserDto(consulta), 
                5, TimeUnit.MINUTES
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentAdminResponseDTO> getAllAppointments(Pageable pageable) {
        String cacheKey = "ADMIN_APPOINTMENTS:" + pageable.getPageNumber() + ":" + pageable.getPageSize();

        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                AppointmentAdminResponseDTO.class,
                () -> consultaRepository.findAll(pageable),
                // CORREÇÃO: Lambda explícito
                consulta -> appointmentMapper.toAdminDto(consulta),
                2, TimeUnit.MINUTES
        );
    }

    // --- ESCRITA ---

    @Override
    @Transactional
    public AppointmentAdminResponseDTO createAppointment(AppointmentOperationDTO operationDTO, User userLogado) {
        try {
            User paciente = (userLogado != null) ? userLogado : consumerHelper.findUserOrThrow(operationDTO.getPatientId());

            HorarioSlot slot = horarioSlotRepository.findByPublicId(operationDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("Horário não encontrado."));

            if (slot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Horário já reservado.");
            }

            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(operationDTO.getTipoConsultaId())
                    .orElseThrow(() -> new BusinessRuleException("Especialidade não encontrada."));

            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("Médico não atende esta especialidade.");
            }

            slot.setStatus(StatusHorario.AGENDADO);
            horarioSlotRepository.save(slot);

            Consulta consulta = new Consulta();
            consulta.setUser(paciente);
            consulta.setMedico(slot.getMedico());
            consulta.setTipoConsulta(tipo);
            consulta.setHorarioSlot(slot);
            consulta.setSintomas(operationDTO.getSintomas());
            consulta.setStatus(ConsultaStatus.PENDENTE);
            // consulta.setPublicId(UUID.randomUUID().toString()); // Descomente se não for gerado no @PrePersist

            Consulta saved = consultaRepository.save(consulta);
            slot.setConsulta(saved);
            horarioSlotRepository.save(slot);

            clearUserAndAdminCaches(paciente.getPublicId().toString());

            return appointmentMapper.toAdminDto(saved);

        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao criar consulta.", e);
        }
    }

    @Override
    @Transactional
    public AppointmentAdminResponseDTO updateAppointment(String id, AppointmentOperationDTO operationDTO) {
        Consulta consulta = consultaRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("Consulta não encontrada"));
                
        User oldUser = consulta.getUser();
        
        String patientIdTarget = operationDTO.getPatientId() != null ? operationDTO.getPatientId() : oldUser.getPublicId().toString();
        User newUser = consumerHelper.findUserOrThrow(patientIdTarget);
        
        TipoConsulta tipo = tipoConsultaRepository.findByPublicId(operationDTO.getTipoConsultaId())
                .orElseThrow(() -> new BusinessRuleException("Tipo inválido."));

        HorarioSlot currentSlot = consulta.getHorarioSlot();
        if (!currentSlot.getPublicId().equals(operationDTO.getHorarioSlotId())) {
            HorarioSlot newSlot = horarioSlotRepository.findByPublicId(operationDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("Novo horário não encontrado."));

            if (newSlot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Novo horário indisponível.");
            }
            if (!newSlot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("Médico incompatível com a especialidade.");
            }

            currentSlot.setStatus(StatusHorario.DISPONIVEL);
            currentSlot.setConsulta(null);
            
            newSlot.setStatus(StatusHorario.AGENDADO);
            
            consulta.setHorarioSlot(newSlot);
            consulta.setMedico(newSlot.getMedico());
            
            horarioSlotRepository.save(currentSlot);
            horarioSlotRepository.save(newSlot);
        }

        consulta.setUser(newUser);
        consulta.setTipoConsulta(tipo);
        consulta.setSintomas(operationDTO.getSintomas());
        
        if (operationDTO.getStatus() != null) {
             try {
                 consulta.setStatus(ConsultaStatus.valueOf(operationDTO.getStatus()));
             } catch (IllegalArgumentException e) {
                 // ignore
             }
        }

        Consulta updated = consultaRepository.save(consulta);

        clearUserAndAdminCaches(oldUser.getPublicId().toString());
        if (!oldUser.equals(newUser)) {
            clearUserAndAdminCaches(newUser.getPublicId().toString());
        }

        return appointmentMapper.toAdminDto(updated);
    }

    @Override
    @Transactional
    public void deleteAppointment(String id) {
        Consulta consulta = consultaRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("Consulta não encontrada"));
                
        HorarioSlot slot = consulta.getHorarioSlot();

        if (slot != null) {
            slot.setStatus(StatusHorario.DISPONIVEL);
            slot.setConsulta(null);
            horarioSlotRepository.save(slot);
        }

        consultaRepository.delete(consulta);
        clearUserAndAdminCaches(consulta.getUser().getPublicId().toString());
    }

    @Override
    public FormOptionsDTO getFormOptions() {
        return helper.getFormOptionsCached(); 
    }

    @Override
    public List<SelectOptionDTO> getHorariosDisponiveisPorTipo(String tipoPublicId) {
        return helper.findSlotsByTipo(tipoPublicId);
    }

    private void clearUserAndAdminCaches(String userPublicId) {
        cacheService.delete(helper.getConsultasCacheKey(userPublicId));
        cacheService.delete("FORM_OPTIONS_STATIC");
        cacheService.deletePattern("ADMIN_APPOINTMENTS:*");
    }
}