package br.edu.fatecpg.usafa.features.Admin.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.Admin.utils.appointment.AppointmentHelper;
import br.edu.fatecpg.usafa.features.Admin.utils.appointment.AppointmentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
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
import br.edu.fatecpg.usafa.features.consulta.utils.IConsultaMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final IConsultaMapper consultaMapper;

    private final IMedicoRepository medicoRepository;
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
    public ConsultaSummaryDTO createAppointment(AppointmentRequestDto requestDTO, User user) {
        try {
            // 1. Validação: Busca as entidades
            Medico medico = medicoRepository.findByPublicId(requestDTO.getDoctorId())
                    .orElseThrow(() -> new BusinessRuleException("Médico não encontrado."));

            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.())
                    .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));

            // 2. Validação: Verifica se o médico pertence à especialidade
            if (!medico.getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico " + medico.getNome() + " não pertence à especialidade " + tipo.getNome() + ".");
            }

            // --- 3. LÓGICA DO HORÁRIO SLOT (A CORREÇÃO) ---
            
            // Converte as strings do DTO para data e hora
            LocalDate dia = consultaMapper.stringToLocalDate(requestDTO.getDia());
            LocalTime horario = consultaMapper.stringToLocalTime(requestDTO.getHorario());
            LocalDateTime dataHoraInicio = LocalDateTime.of(dia, horario);
            
            // Busca o slot exato que o usuário quer agendar
            HorarioSlot slot = horarioSlotRepository
                    .findByMedicoIdAndDataHoraInicio(medico.getId(), dataHoraInicio)
                    .orElseThrow(() -> new BusinessRuleException("Horário não disponível ou não cadastrado."));
            
            // Validação de Negócio: O slot está DISPONÍVEL?
            if (slot.getStatus() != StatusHorario.DISPONIVEL) {
                throw new BusinessRuleException("Este horário não está mais disponível.");
            }
            
            // Trava o slot
            slot.setStatus(StatusHorario.RESERVADO);
            HorarioSlot savedSlot = horarioSlotRepository.save(slot);

            // --- FIM DA LÓGICA DO SLOT ---

            // 4. Mapeamento e Lógica
            Consulta consulta = new Consulta();
            consulta.setUser(user);
            consulta.setMedico(medico);
            consulta.setTipoConsulta(tipo);
            consulta.setSintomas(requestDTO.getSintomas());
            consulta.setStatus(ConsultaStatus.PENDENTE); 

            // Define o slot na consulta (Substitui setDia e setHorario)
            consulta.setHorarioSlot(savedSlot); // <<< CORREÇÃO
            
            // 5. Salva a Consulta
            Consulta savedConsulta = consultaRepository.save(consulta);

            // 6. Invalida o cache
            cacheService.delete(consultaHelper.getConsultasCacheKey(user.getPublicId().toString())); 
            log.info("Cache de consultas invalidado para o usuário: {}", user.getPublicId());

            // 7. Retorna o DTO
            return consultaMapper.toSummaryDTO(savedConsulta);

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada ao criar consulta: {}", e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.error("Erro de banco ao criar consulta para o usuário: {}", user.getPublicId(), e);
            throw new DatabaseOperationException("Erro ao salvar sua solicitação de consulta.", e);
        }
    }

   /**
     * Atualiza uma consulta existente (CRUD do Admin no SQL).
     * Esta é a versão corrigida que lida com HorarioSlot.
     */
    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto) {
        log.info("Atualizando consulta ID: {}", id);

        // 1. Buscar a consulta existente
        Consulta consulta = helper.findConsultaByPublicId(id);
        HorarioSlot oldSlot = consulta.getHorarioSlot(); // Pega o slot atual

        // 2. Validar e buscar dados
        User patient = helper.findPatientByPublicId(appointmentDto.getPatientId());
        Medico doctor = helper.findDoctorByPublicId(appointmentDto.getDoctorId());
        LocalDateTime newDateTime = helper.parseDateTime(appointmentDto.getDateTime());
        ConsultaStatus newStatus = helper.parseStatus(appointmentDto.getStatus());
        
        // 3. Regra de Negócio: O slot/médico mudou?
        boolean doctorChanged = !consulta.getMedico().getId().equals(doctor.getId());
        boolean dateTimeChanged = !oldSlot.getDataHoraInicio().equals(newDateTime);

        if (doctorChanged || dateTimeChanged) {
            log.info("Médico ou horário alterado. Trocando slot...");

            // 3.1. Encontra o NOVO slot
            HorarioSlot newSlot = horarioSlotRepository
                    .findByMedicoIdAndDataHoraInicio(doctor.getId(), newDateTime)
                    .orElseThrow(() -> new BusinessRuleException("Novo horário não disponível ou não cadastrado."));

            // 3.2. Verifica se o NOVO slot está disponível
            if (newSlot.getStatus() != StatusHorario.DISPONIVEL) {
                // (Nota: Em um caso raro, ele pode estar 'RESERVADO' pelo *próprio* 'oldSlot'
                // se o usuário só mudou o médico mas não a data/hora.
                // Mas para um CRUD de Admin, é mais seguro exigir um slot DISPONIVEL)
                throw new BusinessRuleException("Novo horário (" + newDateTime + ") não está disponível.");
            }

            // 3.3. Libera o slot ANTIGO
            oldSlot.setStatus(StatusHorario.DISPONIVEL);
            oldSlot.setConsulta(null); // Quebra a ligação 1:1
            horarioSlotRepository.save(oldSlot);

            // 3.4. Reserva o slot NOVO
            newSlot.setStatus(StatusHorario.RESERVADO);
            newSlot.setConsulta(consulta); // Faz a ligação 1:1
            horarioSlotRepository.save(newSlot);
            
            // 3.5. Atualiza a consulta com o novo slot
            consulta.setHorarioSlot(newSlot);
        }

        // 4. Atualizar o restante dos dados da entidade
        consulta.setUser(patient);
        consulta.setMedico(doctor);
        consulta.setTipoConsulta(doctor.getTipoConsulta()); // Importante se o médico mudou
        consulta.setStatus(newStatus);
        
        try {
            // 5. Salvar a consulta
            Consulta updatedConsulta = consultaRepository.save(consulta);
            
            // 6. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_APPOINTMENTS);

            // 7. Retornar DTO
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