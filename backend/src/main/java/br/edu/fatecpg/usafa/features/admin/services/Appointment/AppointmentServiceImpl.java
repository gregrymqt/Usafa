package br.edu.fatecpg.usafa.features.admin.services.Appointment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentHelper;
import br.edu.fatecpg.usafa.features.admin.utils.appointment.AppointmentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;



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
public Page<AppointmentResponseDto> getAllAppointments(Pageable pageable) { 
        // Chave de cache dinâmica que inclui informações da paginação
        String cacheKey = CACHE_KEY_ALL_APPOINTMENTS + ":" + pageable.getPageNumber() + ":" + pageable.getPageSize();

        // 1. Tenta buscar do cache
        try {
            Page<AppointmentResponseDto> cachedPage = cacheService.get(cacheKey, Page.class);
            if (cachedPage != null) {
                log.info("Retornando todas as consultas do cache. Chave: {}", cacheKey);
                return cachedPage;
            }
        } catch (Exception e) {
            log.warn("Erro ao tentar ler o cache para consultas. Buscando do banco de dados. Erro: {}", e.getMessage());
        }

        log.info("Buscando todas as consultas do banco de dados.");

        try {
            Page<AppointmentResponseDto> page = consultaRepository.findAll(pageable).map(mapper::toDto);
            // 2. Salva o resultado no cache para futuras requisições
            cacheService.save(cacheKey, page);
            return page;
        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar consultas: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao buscar consultas", e);
        }
    }

@Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDTO, User userLogado) {
        try {
            // 1. Resolver quem é o Paciente
            User paciente;
            if (userLogado != null) {
                paciente = userLogado; // Paciente agendando para si mesmo
            } else {
                // Admin agendando: Precisamos buscar o paciente pelo ID do DTO
                if (requestDTO.getPatientId() == null) {
                     throw new BusinessRuleException("Para agendamento administrativo, o ID do paciente é obrigatório.");
                }
                paciente = helper.findPatientByPublicId(requestDTO.getPatientId());
            }

            // 2. Busca e Valida o Slot
            HorarioSlot slot = horarioSlotRepository.findByPublicId(requestDTO.getHorarioSlotId())
                    .orElseThrow(() -> new BusinessRuleException("O horário selecionado não foi encontrado."));

            if (slot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Este horário acabou de ser reservado por outro paciente.");
            }

            // 3. Valida Tipo e Médico
            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoConsultaId())
                    .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));

            if (!slot.getMedico().getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico selecionado não atende esta especialidade.");
            }

            // 4. Trava o Slot
            slot.setStatus(StatusHorario.AGENDADO);
            horarioSlotRepository.save(slot);

            // 5. Cria a Consulta
            Consulta consulta = new Consulta();
            consulta.setUser(paciente); // Usamos a variável resolvida acima
            consulta.setMedico(slot.getMedico());
            consulta.setTipoConsulta(tipo);
            consulta.setHorarioSlot(slot);
            consulta.setSintomas(requestDTO.getSintomas());
            consulta.setStatus(ConsultaStatus.PENDENTE); // Ou pega do DTO se for admin

            Consulta savedConsulta = consultaRepository.save(consulta);
            
            // Link reverso
            slot.setConsulta(savedConsulta);
            horarioSlotRepository.save(slot);

            // 6. INVALIDAÇÃO DE CACHE (CRUCIAL)
            // Limpa o cache do paciente específico
            cacheService.delete("consultas:" + paciente.getPublicId());
            // Se você estivesse usando cache na lista do Admin, limparia aqui:
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS); 

            log.info("Consulta criada. Protocolo: {}", savedConsulta.getPublicId());
            return mapper.toDto(savedConsulta);

        } catch (DataAccessException e) {
            log.error("Erro ao criar consulta", e);
            throw new DatabaseOperationException("Erro técnico ao processar agendamento.", e);
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
        String newSlotId = requestDTO.getHorarioSlotId();

        // Verificamos se houve mudança de horário/médico comparando os IDs dos slots
        if (!currentSlot.getPublicId().equals(newSlotId)) {
            log.info("Detectada alteração de agendamento. Realizando troca de slots...");

            // 3.1. Busca o NOVO slot pelo ID (A "Verdade Absoluta")
            HorarioSlot newSlot = horarioSlotRepository.findByPublicId(newSlotId)
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
            newSlot.setStatus(StatusHorario.AGENDADO);
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
            
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);
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
        Consulta consulta = helper.findConsultaByPublicId(id);
        HorarioSlot slot = consulta.getHorarioSlot();

        // Libera o slot
        if (slot != null) {
            slot.setStatus(StatusHorario.DISPONIVEL);
            slot.setConsulta(null);
            horarioSlotRepository.save(slot);
        }

        consultaRepository.delete(consulta);

        // Invalida caches
        cacheService.delete("consultas:" + consulta.getUser().getPublicId());
        cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);
    }
}