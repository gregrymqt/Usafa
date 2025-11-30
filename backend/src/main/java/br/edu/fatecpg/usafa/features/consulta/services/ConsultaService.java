package br.edu.fatecpg.usafa.features.consulta.services;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.features.consulta.repositories.IConsultaRepository;
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.IConsultaMapper;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
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
    private final IHorarioSlotRepository horarioSlotRepository;

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
            // Você precisa criar este método no IConsultaRepository
            // O campo 'dia' não existe mais, então ordenamos pelo 'dataHoraInicio' do slot.
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

    @Transactional(readOnly = true)
    public List<FormSelectOptionDTO> getHorariosDisponiveisPorTipo(String tipoPublicId) {
        // Busca no banco usando a query nova
        List<HorarioSlot> slots = horarioSlotRepository.findDisponiveisPorTipoConsulta(tipoPublicId);

        // Usa o seu Mapper existente para formatar (25/10 - 14:00)
        return mapper.slotsToOptions(slots);
    }

    // 2. MÉTODO REFATORADO: Carga inicial mais leve
    @Override
    @Transactional(readOnly = true)
    public ConsultaFormOptionsDTO getFormOptions() {
        // Tenta pegar do cache (Tipos e Médicos são estáticos)
        ConsultaFormOptionsDTO cachedBaseOptions = cacheService.get("FORM_OPTIONS_STATIC",
                ConsultaFormOptionsDTO.class);

        if (cachedBaseOptions != null) {
            // Se tem cache, retorna ele.
            // Note que NÃO estamos mais buscando slots aqui.
            return cachedBaseOptions;
        }

        // Se não tem cache, busca Tipos e Médicos
        List<Medico> medicos = medicoRepository.findAll();
        List<TipoConsulta> tipos = tipoConsultaRepository.findAll();

        List<FormSelectOptionDTO> medicosOptions = mapper.medicosToOptions(medicos);
        List<FormSelectOptionDTO> tiposOptions = mapper.tiposToOptions(tipos);

        ConsultaFormOptionsDTO baseOptions = ConsultaFormOptionsDTO.builder()
                .medicos(medicosOptions)
                .tipos(tiposOptions)
                .horarios(new ArrayList<>()) // ARRAY VAZIO! O front buscará depois.
                .build();

        // Salva no cache por 24h
        cacheService.saveWithTtl("FORM_OPTIONS_STATIC", baseOptions, 24, TimeUnit.HOURS);

        return baseOptions;
    }
}