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
import br.edu.fatecpg.usafa.features.consulta.repositories.IHorarioSlotRepository;
import br.edu.fatecpg.usafa.features.consulta.utils.ConsultaHelper;
import br.edu.fatecpg.usafa.features.consulta.utils.IConsultaMapper;
import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;
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
        // 1. Tenta buscar OPÇÕES ESTÁTICAS do Cache (Médicos e Tipos mudam pouco)
        // Nota: Separei o cache de horários do cache de cadastros para evitar conflito de agendamento
        ConsultaFormOptionsDTO cachedBaseOptions = cacheService.get("FORM_OPTIONS_STATIC", ConsultaFormOptionsDTO.class);
        
        List<FormSelectOptionDTO> medicosOptions;
        List<FormSelectOptionDTO> tiposOptions;

        if (cachedBaseOptions != null) {
            medicosOptions = cachedBaseOptions.getMedicos();
            tiposOptions = cachedBaseOptions.getTipos();
        } else {
            // Se não tiver em cache, busca no banco e salva
            List<Medico> medicos = medicoRepository.findAll();
            List<TipoConsulta> tipos = tipoConsultaRepository.findAll();
            
            medicosOptions = mapper.medicosToOptions(medicos); // [cite: 51]
            tiposOptions = mapper.tiposToOptions(tipos);       // [cite: 52]
            
            // Salva apenas a parte estática no cache
            ConsultaFormOptionsDTO baseOptions = ConsultaFormOptionsDTO.builder()
                .medicos(medicosOptions)
                .tipos(tiposOptions)
                .build();
            cacheService.saveWithTtl("FORM_OPTIONS_STATIC", baseOptions, 24, TimeUnit.HOURS);
        }

        try {
            // 2. Busca HORÁRIOS DISPONÍVEIS em Tempo Real (Sem Cache Longo ou Sem Cache)
            // Aqui usamos a entidade HorarioSlot que você criou [cite: 73]
            List<HorarioSlot> slotsLivres = horarioSlotRepository.findByStatus(StatusHorario.DISPONIVEL); // 

            // Usa o novo método do mapper que criamos na resposta anterior
            List<FormSelectOptionDTO> slotsOptions = mapper.slotsToOptions(slotsLivres);

            // 3. Monta o DTO Final
            return ConsultaFormOptionsDTO.builder()
                    .medicos(medicosOptions)
                    .tipos(tiposOptions)
                    // Removemos "dias" separados, pois o slot já contém dia e hora combinados
                    // ou você pode processar os slots para separar no front, mas enviar o slot real é crucial
                    .horarios(slotsOptions) 
                    .build();

        } catch (DataAccessException e) {
            log.error("Erro de banco ao buscar opções.", e);
            throw new DatabaseOperationException("Erro ao carregar opções.", e);
        }
    }
}