package br.edu.fatecpg.usafa.features.consulta.services;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.Admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.IConsultaMapper;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
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
    private final ConsultaHelper helper;

    private static final String FORM_OPTIONS_CACHE_KEY = "CONSULTA_FORM_OPTIONS";

    @Override
    @Transactional(readOnly = true)
    public List<ConsultaDTO> findConsultasByUser(User user) {
        final String cacheKey = helper.getConsultasCacheKey(user.getPublicId().toString());

        try {
            @SuppressWarnings("unchecked")
            List<ConsultaDTO> cachedConsultas = (List<ConsultaDTO>) cacheService.get(cacheKey, List.class);
            if (cachedConsultas != null) {
                log.info("Cache HIT para consultas do usuário: {}", user.getPublicId());
                return cachedConsultas;
            }
        } catch (Exception e) {
            log.warn("Falha ao ler cache de consultas. Buscando no DB. Erro: {}", e.getMessage());
        }

        try {
            log.info("Cache MISS para consultas do usuário: {}", user.getPublicId());
            
            // <<< 2. CORREÇÃO DA ORDENAÇÃO
            //    Você precisa criar este método no IConsultaRepository
            //    O campo 'dia' não existe mais, então ordenamos pelo 'dataHoraInicio' do slot.
            List<Consulta> consultas = consultaRepository.findByUserOrderByHorarioSlotDataHoraInicioDesc(user);
            
            List<ConsultaDTO> dtos = consultas.stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.toList());

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
            List<FormSelectOptionDTO> dias = helper.gerarProximosDias(); 
            List<FormSelectOptionDTO> horarios = helper.gerarHorarios(); 

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
}