package br.edu.fatecpg.usafa.features.admin.services.Appointment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentHelper;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;

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
    private final ConsultaHelper consultaHelper;

    private final ITipoConsultaRepository tipoConsultaRepository;
    private final IHorarioSlotRepository horarioSlotRepository;

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
                    .map(mapper::toDto)
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
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDTO, User user) {
        try {
            // 1. Busca e Valida o Slot de Horário (A "Verdade Absoluta")
            // O DTO agora envia o ID do slot, não data/hora soltas.
            HorarioSlot slot = horarioSlotRepository.findById(requestDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("O horário selecionado não foi encontrado."));

            // 2. Validação CRÍTICA: O slot ainda está livre?
            // Se outro usuário pegou milissegundos antes, o status já será RESERVADO.
            if (slot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException(
                        "Sinto muito, este horário acabou de ser reservado por outro paciente.");
            }

            // 3. Obtém o Médico através do Slot
            // Não precisamos buscar o médico pelo ID do DTO. O slot já pertence a um
            // médico.
            Medico medico = slot.getMedico();

            // 4. Busca e Valida o Tipo de Consulta
            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoConsultaId())
                    .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));

            // Validação: O médico do slot atende essa especialidade?
            if (!medico.getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico selecionado não atende pela especialidade informada.");
            }

            // 5. Trava o Slot (Atualiza Status)
            // Isso impede que o slot apareça na busca de outros usuários imediatamente
            slot.setStatus(StatusHorario.RESERVADO);
            // Opcional: Se a relação for bidirecional, associe a consulta aqui depois de
            // instanciá-la,
            // mas salvar o slot agora garante a reserva.
            horarioSlotRepository.save(slot);

            // 6. Criação da Entidade Consulta
            Consulta consulta = new Consulta();
            consulta.setUser(user); // O paciente passado pelo controller
            consulta.setMedico(medico);
            consulta.setTipoConsulta(tipo);
            consulta.setHorarioSlot(slot); // [cite: 33] Associa o slot travado
            consulta.setSintomas(requestDTO.getSintomas()); // [cite: 34]
            if (requestDTO.getStatus() != null) {
                try {
                    consulta.setStatus(ConsultaStatus.valueOf(requestDTO.getStatus().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    consulta.setStatus(ConsultaStatus.PENDENTE); // Fallback se enviar texto errado
                }
            } else {
                consulta.setStatus(ConsultaStatus.PENDENTE);
            }

            // 7. Salva a Consulta
            Consulta savedConsulta = consultaRepository.save(consulta);

            // Atualiza o slot com a referência da consulta (caso precise navegar Slot ->
            // Consulta)
            slot.setConsulta(savedConsulta);
            horarioSlotRepository.save(slot);

            // 8. Invalida caches pertinentes
            // Limpa o histórico do usuário
            cacheService.delete(consultaHelper.getConsultasCacheKey(user.getPublicId().toString()));
            // IMPORTANTE: Invalida o cache de horários disponíveis (se você estiver usando
            // cache lá)
            // cacheService.delete("FORM_OPTIONS_SLOTS");

            log.info("Consulta criada com sucesso. Protocolo: {}", savedConsulta.getPublicId());

            // 9. Retorna o DTO de resumo
            return mapper.toDto(savedConsulta);

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada ao criar consulta: {}", e.getMessage());
            throw e; // Repassa para o Controller tratar (retornar 400 ou 409)
        } catch (DataAccessException e) {
            log.error("Erro de banco ao criar consulta para o usuário: {}", user.getPublicId(), e);
            throw new DatabaseOperationException("Erro técnico ao processar seu agendamento.", e);
        }
    }

    /**
     * Atualiza uma consulta existente (CRUD do Admin no SQL).
     * Esta é a versão corrigida que lida com HorarioSlot.
     */
    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto requestDTO) {
        log.info("Atualizando consulta ID: {}", id);

        // 1. Buscar a consulta existente
        // (Assumindo que seu helper busca por publicId e retorna a entidade Consulta)
        Consulta consulta = helper.findConsultaByPublicId(id);

        // 2. Validar e buscar dados básicos
        // Se o paciente mudou (ex: erro de cadastro), atualizamos.
        User patient = helper.findPatientByPublicId(requestDTO.getPatientId());

        // Busca o Tipo de Consulta (pode ter mudado a especialidade necessária)
        TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoConsultaId())
                .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));

        // --- 3. LÓGICA DE TROCA DE HORÁRIO (O CORAÇÃO DO UPDATE) ---

        HorarioSlot currentSlot = consulta.getHorarioSlot();
        Long newSlotId = requestDTO.getHorarioSlotId();

        // Verificamos se houve mudança de horário/médico comparando os IDs dos slots
        if (!currentSlot.getId().equals(newSlotId)) {
            log.info("Detectada alteração de agendamento. Realizando troca de slots...");

            // 3.1. Busca o NOVO slot pelo ID (A "Verdade Absoluta")
            HorarioSlot newSlot = horarioSlotRepository.findById(newSlotId)
                    .orElseThrow(() -> new BusinessRuleException("O novo horário selecionado não foi encontrado."));

            // 3.2. Validação: O novo slot está livre?
            if (newSlot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("O novo horário selecionado não está mais disponível.");
            }

            // 3.3. Validação: O médico do NOVO slot atende a especialidade?
            if (!newSlot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico do novo horário não atende a especialidade informada.");
            }

            // 3.4. LIBERA o slot ANTIGO
            // O horário antigo volta a ficar disponível para outros pacientes
            currentSlot.setStatus(StatusHorario.DISPONIVEL);
            currentSlot.setConsulta(null); // Remove a amarração
            horarioSlotRepository.save(currentSlot);

            // 3.5. RESERVA o slot NOVO
            newSlot.setStatus(StatusHorario.RESERVADO);
            // newSlot.setConsulta(consulta); // Será feito ao salvar a consulta, pelo
            // Cascade ou manualmente abaixo
            horarioSlotRepository.save(newSlot);

            // 3.6. Atualiza a consulta com os dados do NOVO slot
            consulta.setHorarioSlot(newSlot);
            consulta.setMedico(newSlot.getMedico()); // O médico muda automaticamente com o slot!
        } else {
            // Se o slot é o mesmo, apenas validamos se a especialidade bate com o médico
            // atual
            if (!consulta.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException(
                        "Conflito: O médico atual não atende o novo tipo de consulta informado.");
            }
        }
        // --- FIM DA LÓGICA DE SLOT ---

        // 4. Atualiza demais dados
        consulta.setUser(patient);
        consulta.setTipoConsulta(tipo);
        consulta.setSintomas(requestDTO.getSintomas());

        try {
            // 5. Salva a consulta atualizada
            Consulta updatedConsulta = consultaRepository.save(consulta);

            // Garante a consistência da bidirecionalidade (opcional, depende do JPA
            // mapping)
            updatedConsulta.getHorarioSlot().setConsulta(updatedConsulta);
            horarioSlotRepository.save(updatedConsulta.getHorarioSlot());

            // 6. Invalida cache (Do usuário antigo e do novo, se mudou)
            cacheService.delete(consultaHelper.getConsultasCacheKey(consulta.getUser().getPublicId().toString()));
            if (!patient.equals(consulta.getUser())) {
                cacheService.delete(consultaHelper.getConsultasCacheKey(patient.getPublicId().toString()));
            }
            // Limpa cache de opções (pois um slot foi liberado e outro ocupado)
            cacheService.delete("FORM_OPTIONS_STATIC"); // Se houver cache de slots

            log.info("Consulta atualizada com sucesso. ID: {}", id);

            // 7. Retorna DTO
            return mapper.toDto(updatedConsulta);

        } catch (DataAccessException e) {
            log.error("Erro de banco ao atualizar consulta: {}", e.getMessage());
            throw new DatabaseOperationException("Erro técnico ao atualizar agendamento.", e);
        }
    }

    @Override
    @Transactional
    public void deleteAppointment(String id) {
        log.info("Deletando consulta ID: {}", id);

        // 1. Buscar a consulta
        Consulta consulta = helper.findConsultaByPublicId(id);
        HorarioSlot slot = consulta.getHorarioSlot();

        try {
            // 2. Deletar a consulta
            // (O @OneToOne(mappedBy = "consulta") no Slot pode ser configurado
            // para quebrar o link, mas é mais seguro fazer manualmente)

            // Primeiro, quebra o link no slot e o libera
            if (slot != null) {
                slot.setStatus(StatusHorario.DISPONIVEL);
                slot.setConsulta(null);
                horarioSlotRepository.save(slot);
            }

            // Agora deleta a consulta
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