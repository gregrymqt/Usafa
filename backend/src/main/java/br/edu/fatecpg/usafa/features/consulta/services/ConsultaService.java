package br.edu.fatecpg.usafa.features.consulta.services;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.features.consulta.mappers.IConsultaMapper;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultaService implements IConsultaService {

    private final IConsultaRepository consultaRepository;
    private final IMedicoRepository medicoRepository;
    private final ITipoConsultaRepository tipoConsultaRepository;
    private final IConsultaMapper mapper;
    private final ICacheService cacheService;

    private String getConsultasCacheKey(String userPublicId) {
        return "CONSULTAS_USER_" + userPublicId;
    }
    private static final String FORM_OPTIONS_CACHE_KEY = "CONSULTA_FORM_OPTIONS";

    @Override
    @Transactional(readOnly = true)
    public List<ConsultaDTO> findConsultasByUser(User user) {
        final String cacheKey = getConsultasCacheKey(user.getPublicId().toString());

        try {
            // A anotação SuppressWarnings é usada para o cast de List para List<ConsultaDTO>
            // 1. Tenta buscar do Cache
            @SuppressWarnings("unchecked") List<ConsultaDTO> cachedConsultas = (List<ConsultaDTO>) cacheService.get(cacheKey, List.class);
            if (cachedConsultas != null) {
                log.info("Cache HIT para consultas do usuário: {}", user.getPublicId());
                return cachedConsultas;
            }
        } catch (Exception e) {
            log.warn("Falha ao ler cache de consultas. Buscando no DB. Erro: {}", e.getMessage());
        }

        try {
            // 2. Se não achar, busca no DB
            log.info("Cache MISS para consultas do usuário: {}", user.getPublicId());
            List<Consulta> consultas = consultaRepository.findByUserOrderByDiaDesc(user);
            List<ConsultaDTO> dtos = consultas.stream()
                    .map(mapper::toDTO) // ou .map(consulta -> mapper.toDTO(consulta))
                    .collect(Collectors.toList());

            // 3. Salva no cache (expira em 5 minutos)
            cacheService.saveWithTtl(cacheKey, dtos, 5, TimeUnit.MINUTES);
            return dtos;

        } catch (DataAccessException e) {
            log.error("Erro de banco ao buscar consultas para o usuário: {}", user.getPublicId(), e);
            throw new DatabaseOperationException("Erro ao consultar seu histórico de consultas.", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ConsultaFormOptionsDTO getFormOptions() {
        try {
            // 1. Tenta buscar do Cache
            ConsultaFormOptionsDTO cachedOptions = cacheService.get(FORM_OPTIONS_CACHE_KEY, ConsultaFormOptionsDTO.class);
            if (cachedOptions != null) {
                log.info("Cache HIT para opções do formulário.");
                return cachedOptions;
            }
        } catch (Exception e) {
            log.warn("Falha ao ler cache de opções. Buscando no DB. Erro: {}", e.getMessage());
        }

        try {
            // 2. Se não achar, busca no DB
            log.info("Cache MISS para opções do formulário. Buscando no DB.");
            List<Medico> medicos = medicoRepository.findAll();
            List<TipoConsulta> tipos = tipoConsultaRepository.findAll();

            // 3. Lógica de Negócio para gerar dias e horários (como no LogErro)
            List<FormSelectOptionDTO> dias = gerarProximosDias();
            List<FormSelectOptionDTO> horarios = gerarHorarios();

            // 4. Mapeia e constrói o DTO
            ConsultaFormOptionsDTO options = ConsultaFormOptionsDTO.builder()
                    .medicos(mapper.medicosToOptions(medicos))
                    .tipos(mapper.tiposToOptions(tipos))
                    .dias(dias)
                    .horarios(horarios)
                    .build();

            // 5. Salva no cache (expira em 1 hora)
            cacheService.saveWithTtl(FORM_OPTIONS_CACHE_KEY, options, 1, TimeUnit.HOURS);
            return options;

        } catch (DataAccessException e) {
            log.error("Erro de banco ao buscar opções do formulário.", e);
            throw new DatabaseOperationException("Erro ao carregar opções de agendamento.", e);
        }
    }

    @Override
    @Transactional
    public ConsultaSummaryDTO createConsulta(ConsultaRequestDTO requestDTO, User user) {
        try {
            // 1. Validação: Busca as entidades
            Medico medico = medicoRepository.findByPublicId(requestDTO.getMedicoId())
                    .orElseThrow(() -> new BusinessRuleException("Médico não encontrado."));

            TipoConsulta tipo = tipoConsultaRepository.findByPublicId(requestDTO.getTipoId())
                    .orElseThrow(() -> new BusinessRuleException("Tipo de consulta não encontrado."));

            // 2. Validação: Verifica se o médico pertence à especialidade
            if (!medico.getTipoConsulta().getId().equals(tipo.getId())) {
                throw new BusinessRuleException("O médico " + medico.getNome() + " não pertence à especialidade " + tipo.getNome() + ".");
            }

            // 3. Mapeamento e Lógica
            Consulta consulta = new Consulta();
            consulta.setUser(user);
            consulta.setMedico(medico);
            consulta.setTipoConsulta(tipo);
            consulta.setSintomas(requestDTO.getSintomas());
            consulta.setStatus(ConsultaStatus.PENDENTE); // Status inicial

            // Converte Strings para os tipos do banco (com o mapper)
            consulta.setDia(mapper.stringToLocalDate(requestDTO.getDia()));
            consulta.setHorario(mapper.stringToLocalTime(requestDTO.getHorario()));
            
            // 4. Salva
            Consulta savedConsulta = consultaRepository.save(consulta);

            // 5. Invalida o cache do histórico do usuário
            cacheService.delete(getConsultasCacheKey(user.getPublicId().toString()));
            log.info("Cache de consultas invalidado para o usuário: {}", user.getPublicId());

            // 6. Retorna o DTO de Sucesso
            return mapper.toSummaryDTO(savedConsulta);

        } catch (BusinessRuleException e) {
            log.warn("Regra de negócio violada ao criar consulta: {}", e.getMessage());
            throw e; // Re-lança para o Controller (que vira 400 Bad Request)
        } catch (DataAccessException e) {
            log.error("Erro de banco ao criar consulta para o usuário: {}", user.getPublicId(), e);
            throw new DatabaseOperationException("Erro ao salvar sua solicitação de consulta.", e);
        }
    }


    // --- Métodos de Negócio (Helpers) ---

    // (Pode ser movido para um 'AvailabilityService' no futuro)

    private List<FormSelectOptionDTO> gerarProximosDias() {
        // Gera os próximos 7 dias úteis
        return Stream.iterate(LocalDate.now(), d -> d.plusDays(1))
                .filter(d -> !d.getDayOfWeek().equals(java.time.DayOfWeek.SATURDAY) &&
                             !d.getDayOfWeek().equals(java.time.DayOfWeek.SUNDAY))
                .limit(7)
                .map(d -> new FormSelectOptionDTO(
                        d.format(IConsultaMapper.DATE_FORMATTER),
                        d.format(DateTimeFormatter.ofPattern("dd/MM (EEEE)", IConsultaMapper.LOCALE_BR))
                ))
                .collect(Collectors.toList());
    }

    private List<FormSelectOptionDTO> gerarHorarios() {
        // Gera horários (ex: 09:00, 10:00, ... 16:00)
        return Arrays.asList(
                new FormSelectOptionDTO("09:00", "09:00"),
                new FormSelectOptionDTO("10:00", "10:00"),
                new FormSelectOptionDTO("11:00", "11:00"),
                new FormSelectOptionDTO("13:00", "13:00 (Tarde)"),
                new FormSelectOptionDTO("14:00", "14:00"),
                new FormSelectOptionDTO("15:00", "15:00"),
                new FormSelectOptionDTO("16:00", "16:00")
        );
    }
}
