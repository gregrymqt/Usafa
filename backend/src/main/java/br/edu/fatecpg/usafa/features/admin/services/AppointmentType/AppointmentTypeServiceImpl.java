package br.edu.fatecpg.usafa.features.admin.services.AppointmentType;


import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.AppointmentType.IAppointmentTypeService;
import br.edu.fatecpg.usafa.features.admin.repositories.ITipoConsultaRepository;
import br.edu.fatecpg.usafa.features.admin.utils.appointmentType.AppointmentTypeHelper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AppointmentTypeServiceImpl implements IAppointmentTypeService {

    private final ITipoConsultaRepository tipoConsultaRepository;
    private final AppointmentTypeHelper appointmentTypeHelper;
    private final ICacheService cacheService; // Injeção do serviço de Cache [cite: 41]

    // Chave única para identificar a lista de tipos de consulta no Redis
    private final String CACHE_KEY = "appointment_types:list"; 

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentTypeResponseDto> getAll() {
        // 1. Tenta buscar do Cache primeiro
        try {
            List<AppointmentTypeResponseDto> cachedList = cacheService.get(CACHE_KEY, List.class);
            if (cachedList != null) {
                return cachedList;
            }
        } catch (Exception e) {
            // Se o Redis falhar, apenas logamos e seguimos para o banco (Fail-safe)
            System.err.println("Erro ao buscar do cache: " + e.getMessage());
        }

        // 2. Se não estiver no cache, busca do Banco de Dados
        List<AppointmentTypeResponseDto> dtoList = tipoConsultaRepository.findAll().stream()
                .map(appointmentTypeHelper::toDto)
                .collect(Collectors.toList());

        // 3. Salva no Cache com um tempo de vida (ex: 1 hora) para evitar dados muito obsoletos
        // Usando o método saveWithTtl da sua interface [cite: 42]
        cacheService.saveWithTtl(CACHE_KEY, dtoList, 1, TimeUnit.HOURS);

        return dtoList;
    }

    @Override
    @Transactional
    public AppointmentTypeResponseDto create(AppointmentTypeRequestDto requestDto) {
        // Validação de regra de negócio (Nome duplicado)
        if (tipoConsultaRepository.findByNomeIgnoreCase(requestDto.getNome()).isPresent()) {
            throw new BusinessRuleException("Este tipo de consulta já existe."); // [cite: 44]
        }

        TipoConsulta tipoConsulta = new TipoConsulta();
        tipoConsulta.setNome(requestDto.getNome());
        tipoConsulta.setPublicId(UUID.randomUUID().toString());

        TipoConsulta saved = tipoConsultaRepository.save(tipoConsulta);
        
        // INVALIDAÇÃO DE CACHE: Como os dados mudaram, limpamos o cache antigo
        cacheService.delete(CACHE_KEY); 

        return appointmentTypeHelper.toDto(saved);
    }

    @Override
    @Transactional
    public AppointmentTypeResponseDto update(String publicId, AppointmentTypeRequestDto requestDto) {
        TipoConsulta tipoConsulta = tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Tipo de consulta não encontrado.")); // [cite: 46]

        // Validação para garantir que não estamos atualizando para um nome que já existe em OUTRO registro
        tipoConsultaRepository.findByNomeIgnoreCase(requestDto.getNome()).ifPresent(existing -> {
            if (!existing.getPublicId().equals(publicId)) {
                throw new BusinessRuleException("Outro tipo de consulta com este nome já existe.");
            }
        });

        tipoConsulta.setNome(requestDto.getNome());
        TipoConsulta updated = tipoConsultaRepository.save(tipoConsulta);

        // INVALIDAÇÃO DE CACHE
        cacheService.delete(CACHE_KEY);

        return appointmentTypeHelper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(String publicId) {
        TipoConsulta tipoConsulta = tipoConsultaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new NotFoundException("Tipo de consulta não encontrado."));

        // Validação de integridade referencial
        if (!tipoConsulta.getMedicos().isEmpty()) {
            throw new BusinessRuleException("Não é possível deletar. Este tipo de consulta está sendo usado por médicos.");
        }

        tipoConsultaRepository.delete(tipoConsulta);

        // INVALIDAÇÃO DE CACHE
        cacheService.delete(CACHE_KEY);
    }
}