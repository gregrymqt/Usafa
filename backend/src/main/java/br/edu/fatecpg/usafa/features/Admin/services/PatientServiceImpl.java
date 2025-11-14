package br.edu.fatecpg.usafa.features.Admin.services;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IPatientService;
import br.edu.fatecpg.usafa.features.Admin.utils.patient.PatientHelper;
import br.edu.fatecpg.usafa.features.Admin.utils.patient.PatientMapper;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements IPatientService {

    // Repositórios e Serviços principais
    private final IUserRepository userRepository;
    private final ICacheService cacheService;
    // (Você pode precisar do PasswordEncoder aqui se 'createPatient' definir uma senha)
    // private final PasswordEncoder passwordEncoder; 

    // Classes auxiliares
    private final PatientMapper mapper;
    private final PatientHelper helper;

    private static final String CACHE_KEY_ALL_PATIENTS = "patients:all";

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> getAllPatients() {
        log.info("Buscando todos os pacientes");

        // 1. Tentar buscar do cache
        try {
            @SuppressWarnings("unchecked")
            List<PatientResponseDto> cachedPatients = cacheService.get(CACHE_KEY_ALL_PATIENTS, List.class);
            if (cachedPatients != null) {
                log.info("Retornando {} pacientes do cache", cachedPatients.size());
                return cachedPatients;
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar do cache: {}", e.getMessage());
        }

        try {
            // 2. Cache miss: Buscar do banco
            log.info("Cache miss. Buscando do banco de dados...");
            // ATENÇÃO: Isso busca TODOS os usuários. Se "Paciente" for um
            // subconjunto (ex: por Role), você deve alterar esta query.
            List<User> patients = userRepository.findAll();

            // 3. Mapear para DTO
            List<PatientResponseDto> dtos = patients.stream()
                    .map(mapper::toDto)
                    .collect(Collectors.toList());

            // 4. Salvar no cache por 10 minutos
            cacheService.saveWithTtl(CACHE_KEY_ALL_PATIENTS, dtos, 10, TimeUnit.MINUTES); 
            return dtos;

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar pacientes: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao buscar pacientes", e); 
        }
    }

    @Override
    @Transactional
    public PatientResponseDto createPatient(PatientRequestDto patientDto) {
        log.info("Criando novo paciente com email: {}", patientDto.getEmail());

        // 1. Validar e converter dados (delegado ao Helper)
        LocalDate birthDate = helper.parseBirthDate(patientDto.getBirthDate());

        // 2. Mapear DTO para Entidade
        User user = new User();
        user.setName(patientDto.getName());
        user.setEmail(patientDto.getEmail());
        user.setCpf(patientDto.getCpf());
        user.setCep(patientDto.getCep()); 
        user.setPhone(patientDto.getPhone());
        user.setBirthDate(birthDate);
        
        // Nota: A senha não está no DTO. Se for obrigatória,
        // o DTO precisa ser ajustado ou uma senha padrão gerada.
        // Ex: user.setPassword(passwordEncoder.encode("senhaPadrao"));
        
        try {
            // 3. Salvar
            User savedUser = userRepository.save(user);
            log.info("Paciente criado com ID: {}", savedUser.getPublicId());

            // 4. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_PATIENTS);

            // 5. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(savedUser);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao salvar paciente: {}", e.getMessage());
            if (e.getMessage().contains("ConstraintViolationException")) {
                 throw new BusinessRuleException("Email ou CPF já cadastrado.", e); 
            }
            throw new DatabaseOperationException("Erro ao salvar paciente", e);
        }
    }

    @Override
    @Transactional
    public PatientResponseDto updatePatient(String id, PatientRequestDto patientDto) {
        log.info("Atualizando paciente ID: {}", id);

        // 1. Buscar entidade (delegado ao Helper)
        User user = helper.findPatientByPublicId(id);

        // 2. Validar e converter dados (delegado ao Helper)
        LocalDate birthDate = helper.parseBirthDate(patientDto.getBirthDate());

        // 3. Atualizar entidade (delegado ao Mapper)
        mapper.updateEntity(patientDto, user, birthDate);

        try {
            // 4. Salvar
            User updatedUser = userRepository.save(user);

            // 5. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_PATIENTS);

            // 6. Retornar DTO (delegado ao Mapper)
            return mapper.toDto(updatedUser);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao atualizar paciente: {}", e.getMessage());
             if (e.getMessage().contains("ConstraintViolationException")) {
                 throw new BusinessRuleException("Email ou CPF já cadastrado.", e); 
            }
            throw new DatabaseOperationException("Erro ao atualizar paciente", e); 
        }
    }

    @Override
    @Transactional
    public void deletePatient(String id) { 
        log.info("Deletando paciente ID: {}", id);

        // 1. Buscar entidade (delegado ao Helper)
        User user = helper.findPatientByPublicId(id);

        // 2. REGRA DE NEGÓCIO (delegado ao Helper)
        helper.validatePatientHasNoAppointments(user);
        
        try {
            // 3. Deletar
            userRepository.delete(user);
            // (Alternativa: userRepository.deleteByPublicId(user.getPublicId()))

            // 4. Invalidar cache
            cacheService.delete(CACHE_KEY_ALL_PATIENTS);
            log.info("Paciente ID {} deletado e cache invalidado", id);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao deletar paciente: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao deletar paciente", e); 
        }
    }
}
