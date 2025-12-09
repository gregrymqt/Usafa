package br.edu.fatecpg.usafa.features.consulta.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.repositories.IHorarioSlotRepository;
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

import java.util.Arrays;
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
                5, TimeUnit.MINUTES);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentAdminResponseDTO> getAllAppointments(Pageable pageable, String search) {
        // IMPORTANTE: Adicione o 'search' na chave do cache para evitar conflitos de
        // cache
        String searchKey = (search != null) ? search.trim() : "";
        String cacheKey = "ADMIN_APPOINTMENTS:" + pageable.getPageNumber() + ":" + pageable.getPageSize() + ":"
                + searchKey;

        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                AppointmentAdminResponseDTO.class,
                () -> {
                    // Se tiver termo de busca, usa o método customizado do repositório
                    if (!searchKey.isEmpty()) {
                        return consultaRepository.searchConsultas(searchKey, pageable);
                    }
                    // Se não, busca tudo
                    return consultaRepository.findAll(pageable);
                },
                // Mapper
                consulta -> appointmentMapper.toAdminDto(consulta),
                2, TimeUnit.MINUTES);
    }

    // --- ESCRITA ---

    @Override
    @Transactional
    public AppointmentAdminResponseDTO createAppointment(AppointmentOperationDTO operationDTO, User userLogado) {
        try {
            User paciente = (userLogado != null) ? userLogado
                    : consumerHelper.findUserOrThrow(operationDTO.getPatientId());

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
            // consulta.setPublicId(UUID.randomUUID().toString()); // Descomente se não for
            // gerado no @PrePersist

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
        // 1. Busca a consulta existente
        Consulta consulta = consultaRepository.findByPublicId(id)
                .orElseThrow(() -> new NotFoundException("Consulta não encontrada"));

        User oldUser = consulta.getUser();

        // 2. Atualiza dados básicos (Sintomas)
        // Se o front mandar vazio, mantém o que estava.
        if (operationDTO.getSintomas() != null) {
            consulta.setSintomas(operationDTO.getSintomas());
        }

        // 3. Lógica de Status (Aqui estava o erro do log)
        if (operationDTO.getStatus() != null && !operationDTO.getStatus().isEmpty()) {
            try {
                // Converte a String do front (ex: "FINALIZADA") para o Enum
                ConsultaStatus novoStatus = ConsultaStatus.valueOf(operationDTO.getStatus());
                consulta.setStatus(novoStatus);

                // LÓGICA EXTRA: Se cancelou, libera o slot?
                // Se o status for CANCELADA, o slot volta a ficar DISPONIVEL
                if (novoStatus == ConsultaStatus.CANCELADA) {
                    HorarioSlot slotAtual = consulta.getHorarioSlot();
                    if (slotAtual != null) {
                        slotAtual.setStatus(StatusHorario.DISPONIVEL);
                        slotAtual.setConsulta(null);
                        horarioSlotRepository.save(slotAtual);

                        // Desvincula da consulta para histórico
                        consulta.setHorarioSlot(null);
                    }
                }

            } catch (IllegalArgumentException e) {
                // Isso captura o erro "FINALIZADO" se não estiver no Enum
                throw new BusinessRuleException("Status inválido: " + operationDTO.getStatus() +
                        ". Valores aceitos: " + Arrays.toString(ConsultaStatus.values()));
            }
        }

        // 4. Lógica de Troca de Slot (Só executa se o slot tiver mudado E a consulta
        // não foi cancelada)
        if (operationDTO.getHorarioSlotId() != null
                && consulta.getHorarioSlot() != null // garante que não está cancelada
                && !consulta.getHorarioSlot().getPublicId().equals(operationDTO.getHorarioSlotId())) {

            HorarioSlot currentSlot = consulta.getHorarioSlot();

            // Busca o NOVO slot desejado
            HorarioSlot newSlot = horarioSlotRepository.findByPublicId(operationDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("Novo horário não encontrado."));

            // Valida se o novo está livre
            if (newSlot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("O novo horário escolhido já está ocupado.");
            }

            // A. Libera o slot antigo
            currentSlot.setStatus(StatusHorario.DISPONIVEL);
            currentSlot.setConsulta(null);
            horarioSlotRepository.saveAndFlush(currentSlot); // Flush evita erro de concorrência

            // B. Ocupa o novo slot
            newSlot.setStatus(StatusHorario.AGENDADO);
            newSlot.setConsulta(consulta); // Vincula bidirectional se necessário
            horarioSlotRepository.save(newSlot);

            // C. Atualiza a consulta
            consulta.setHorarioSlot(newSlot);
            consulta.setMedico(newSlot.getMedico());
        }

        // 5. Salva tudo
        Consulta updated = consultaRepository.save(consulta);

        // 6. Limpa Cache
        clearUserAndAdminCaches(oldUser.getPublicId().toString());

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