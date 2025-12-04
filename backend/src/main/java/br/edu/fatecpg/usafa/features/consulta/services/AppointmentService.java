package br.edu.fatecpg.usafa.features.consulta.services;


import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentHelper;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
import br.edu.fatecpg.usafa.features.consulta.dtos.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.mappers.IConsultaMapper;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService implements IAppointmentService {

    // Repositories
    private final IConsultaRepository consultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;

    // Helpers & Utils
    private final ICacheService cacheService;
    private final PageCacheHelper pageCacheHelper;
    private final AppointmentHelper helper;
    private final ConsultaHelper consultaHelper;

    // Mappers
    private final AppointmentMapper adminMapper;
    private final IConsultaMapper publicMapper;
    
    // --- LEITURA (PUBLIC & ADMIN) ---

    /**
     * [PUBLIC] Busca histórico de consultas de um usuário específico.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ConsultaDTO> findConsultasByUser(User user, Pageable pageable) {
        String cacheKey = consultaHelper.getConsultasCacheKey(
                user.getPublicId().toString() + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize());

        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                ConsultaDTO.class,
                () -> consultaRepository.findByUser(user, pageable),
                publicMapper::toDTO,
                5, TimeUnit.MINUTES
        );
    }

    /**
     * [ADMIN] Busca todas as consultas do sistema.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponseDto> getAllAppointments(Pageable pageable) {
        String cacheKey = "ADMIN_APPOINTMENTS:" + pageable.getPageNumber() + ":" + pageable.getPageSize();

        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                AppointmentResponseDto.class,
                () -> consultaRepository.findAll(pageable),
                adminMapper::toDto,
                2, TimeUnit.MINUTES
        );
    }

    // --- ESCRITA (ADMIN) ---

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDTO, User userLogado) {
        try {
            // 1. Resolve Paciente
            User paciente = (userLogado != null) ? userLogado : helper.findPatientByPublicId(requestDTO.getPatientId());

            // 2. Validações de Slot e Tipo
            HorarioSlot slot = horarioSlotRepository.findByPublicId(requestDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("Horário não encontrado."));

            if (slot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Horário já reservado.");
            }

            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoConsultaId())
                    .orElseThrow(() -> new BusinessRuleException("Especialidade não encontrada."));

            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("Médico não atende esta especialidade.");
            }

            // 3. Atualiza Slot
            slot.setStatus(StatusHorario.AGENDADO);
            horarioSlotRepository.save(slot);

            // 4. Salva Consulta
            Consulta consulta = new Consulta();
            consulta.setUser(paciente);
            consulta.setMedico(slot.getMedico());
            consulta.setTipoConsulta(tipo);
            consulta.setHorarioSlot(slot);
            consulta.setSintomas(requestDTO.getSintomas());
            consulta.setStatus(ConsultaStatus.PENDENTE);

            Consulta saved = consultaRepository.save(consulta);
            slot.setConsulta(saved); // Link Reverso
            horarioSlotRepository.save(slot);

            // 5. Limpa Caches
            clearUserAndAdminCaches(paciente.getPublicId().toString());

            return adminMapper.toDto(saved);

        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao criar consulta.", e);
        }
    }

    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto requestDTO) {
        Consulta consulta = helper.findConsultaByPublicId(id);
        User oldUser = consulta.getUser();
        
        // Validações básicas
        User newUser = helper.findPatientByPublicId(requestDTO.getPatientId());
        TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoConsultaId())
                .orElseThrow(() -> new BusinessRuleException("Tipo inválido."));

        // Lógica de Troca de Slot
        HorarioSlot currentSlot = consulta.getHorarioSlot();
        if (!currentSlot.getPublicId().equals(requestDTO.getHorarioSlotId())) {
            HorarioSlot newSlot = horarioSlotRepository.findByPublicId(requestDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("Novo horário não encontrado."));

            if (newSlot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Novo horário indisponível.");
            }
            if (!newSlot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("Médico incompatível com a especialidade.");
            }

            // Troca
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
        consulta.setSintomas(requestDTO.getSintomas());

        Consulta updated = consultaRepository.save(consulta);

        // Limpa caches (do usuário antigo, do novo e do admin)
        clearUserAndAdminCaches(oldUser.getPublicId().toString());
        if (!oldUser.equals(newUser)) {
            clearUserAndAdminCaches(newUser.getPublicId().toString());
        }

        return adminMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteAppointment(String id) {
        Consulta consulta = helper.findConsultaByPublicId(id);
        HorarioSlot slot = consulta.getHorarioSlot();

        if (slot != null) {
            slot.setStatus(StatusHorario.DISPONIVEL);
            slot.setConsulta(null);
            horarioSlotRepository.save(slot);
        }

        consultaRepository.delete(consulta);
        clearUserAndAdminCaches(consulta.getUser().getPublicId().toString());
    }

    // Helper privado para limpar caches
    private void clearUserAndAdminCaches(String userPublicId) {
        cacheService.delete(consultaHelper.getConsultasCacheKey(userPublicId));
        cacheService.delete("FORM_OPTIONS_STATIC"); // Libera slots no form
        cacheService.deletePattern("ADMIN_APPOINTMENTS:*");
    }
}