package br.edu.fatecpg.usafa.features.Admin.services;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IDoctorService;
import br.edu.fatecpg.usafa.features.Admin.utils.doctor.DoctorHelper;
import br.edu.fatecpg.usafa.features.Admin.utils.doctor.DoctorMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.repository.IMedicoRepository;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorServiceImpl implements IDoctorService {

    // Repositórios e Serviços principais
    private final IMedicoRepository medicoRepository;
    private final ICacheService cacheService;

    // Classes auxiliares
    private final DoctorHelper helper;
    private final DoctorMapper mapper;

    private static final String CACHE_KEY_ALL_DOCTORS = "doctors:all";

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDto> getAllDoctors() {
        log.info("Buscando todos os médicos");

        // 1. Tentar buscar do cache
        try {
            @SuppressWarnings("unchecked")
            List<DoctorResponseDto> cachedDoctors = cacheService.get(CACHE_KEY_ALL_DOCTORS, List.class);
            if (cachedDoctors != null) {
                log.info("Retornando {} médicos do cache", cachedDoctors.size());
                return cachedDoctors;
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar do cache: {}", e.getMessage());
        }

        try {
            // 2. Cache miss: Buscar do banco
            log.info("Cache miss. Buscando do banco de dados...");
            List<Medico> medicos = medicoRepository.findAll();

            // 3. Mapear para DTO
            List<DoctorResponseDto> dtos = medicos.stream()
                    .map(mapper::toDto) // Usa o Mapper
                    .collect(Collectors.toList());

            // 4. Salvar no cache por 10 minutos
            cacheService.saveWithTtl(CACHE_KEY_ALL_DOCTORS, dtos, 10, TimeUnit.MINUTES);
            return dtos;

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar médicos: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao buscar médicos", e); 
        }
    }

    @Override
    @Transactional
    public DoctorResponseDto createDoctor(DoctorRequestDto doctorDto) {
        log.info("Criando novo médico com CRM: {}", doctorDto.getCrm());

        // 1. Validar e buscar entidades (delegado ao Helper)
        TipoConsulta especialidade = helper.findSpecialtyByName(doctorDto.getSpecialty());

        // 2. Mapear DTO para Entidade
        Medico medico = new Medico();
        medico.setNome(doctorDto.getName());
        medico.setEmail(doctorDto.getEmail()); // Campo adicionado
        medico.setCrm(doctorDto.getCrm());     // Campo adicionado
        medico.setTipoConsulta(especialidade); 
        
        try {
            // 3. Salvar
            Medico savedMedico = medicoRepository.save(medico);
            log.info("Médico criado com ID: {}", savedMedico.getPublicId());

            // 4. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_DOCTORS); 

            // 5. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(savedMedico);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao salvar médico: {}", e.getMessage());
            // Trata exceção de constraint (ex: email ou CRM duplicado)
            if (e.getMessage().contains("ConstraintViolationException")) {
                 throw new BusinessRuleException("Email ou CRM já cadastrado.", e); 
            }
            throw new DatabaseOperationException("Erro ao salvar médico", e); 
        }
    }

    @Override
    @Transactional
    public DoctorResponseDto updateDoctor(String id, DoctorRequestDto doctorDto) { 
        log.info("Atualizando médico ID: {}", id);

        // 1. Buscar entidades (delegado ao Helper)
        Medico medico = helper.findDoctorByPublicId(id);
        TipoConsulta especialidade = helper.findSpecialtyByName(doctorDto.getSpecialty());

        // 2. Atualizar a entidade
        medico.setNome(doctorDto.getName());
        medico.setEmail(doctorDto.getEmail()); // Campo adicionado
        medico.setCrm(doctorDto.getCrm());     // Campo adicionado
        medico.setTipoConsulta(especialidade); 

        try {
            // 3. Salvar
            Medico updatedMedico = medicoRepository.save(medico);

            // 4. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_DOCTORS);

            // 5. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(updatedMedico);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao atualizar médico: {}", e.getMessage());
             if (e.getMessage().contains("ConstraintViolationException")) {
                 throw new BusinessRuleException("Email ou CRM já cadastrado.", e); 
            }
            throw new DatabaseOperationException("Erro ao atualizar médico", e); 
        }
    }

    @Override
    @Transactional
    public void deleteDoctor(String id) {
        log.info("Deletando médico ID: {}", id);

        // 1. Buscar entidade (delegado ao Helper)
        Medico medico = helper.findDoctorByPublicId(id);

        // 2. REGRA DE NEGÓCIO (delegado ao Helper)
        helper.validateDoctorHasNoAppointments(medico);
        
        try {
            // 3. Deletar
            medicoRepository.delete(medico);

            // 4. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_DOCTORS); 
            log.info("Médico ID {} deletado e cache invalidado", id);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao deletar médico: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao deletar médico", e); 
        }
    }
}
