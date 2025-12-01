package br.edu.fatecpg.usafa.features.admin.services.Patient;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPatientService;
import br.edu.fatecpg.usafa.features.admin.utils.patient.PatientHelper;
import br.edu.fatecpg.usafa.features.admin.utils.patient.PatientMapper;
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

    private final IUserRepository userRepository;
    private final ICacheService cacheService;
    private final PatientMapper mapper;
    private final PatientHelper helper;
    private final IPasswordCreationTokenService passwordCreationTokenService;

    private static final String CACHE_KEY_ALL_PATIENTS = "patients:all";

    /**
     * Busca paginada com filtro opcional por texto.
     * Não utiliza cache devido à dinamicidade dos parâmetros (página, tamanho, busca).
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponseDto> getAllPatients(String search, Pageable pageable) {
        log.info("Buscando pacientes paginados. Page: {}, Size: {}, Search: '{}'", 
                pageable.getPageNumber(), pageable.getPageSize(), search);

        Page<User> userPage;

        // Verifica se há termo de busca (ignora espaços em branco)
        if (search != null && !search.trim().isEmpty()) {
            // Busca por Nome OU Email contendo o termo
            userPage = userRepository.searchPatients(
                    search, pageable);
        } else {
            // Busca todos sem filtro
            userPage = userRepository.findAllPatients(pageable);
        }

        // Mapeia a Page<User> para Page<PatientResponseDto>
        return userPage.map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> searchByCpf(String cpf) {
        log.info("Buscando paciente específico pelo CPF: {}", cpf);

        // A query no repositório já exclui usuários com o papel 'ADMIN'.
        return userRepository.findPatientByCpf(cpf)
                .map(mapper::toDto)
                .map(List::of)
                .orElse(Collections.emptyList());
    }

    /**
     * Busca todos (Lista completa).
     * Mantido com Cache para uso em dropdowns ou relatórios simples.
     */
    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> getAllPatients() {
        log.info("Buscando todos os pacientes (sem paginação)");

        try {
            @SuppressWarnings("unchecked")
            List<PatientResponseDto> cachedPatients = cacheService.get(CACHE_KEY_ALL_PATIENTS, List.class);
            if (cachedPatients != null) {
                return cachedPatients;
            }
        } catch (Exception e) {
            log.warn("Erro ao buscar do cache: {}", e.getMessage());
        }

        List<User> patients = userRepository.findAll();
        List<PatientResponseDto> dtos = patients.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        cacheService.saveWithTtl(CACHE_KEY_ALL_PATIENTS, dtos, 10, TimeUnit.MINUTES);
        return dtos;
    }

    // --- MÉTODOS DE ESCRITA (MANTIDOS IGUAIS) ---

    @Override
    @Transactional
    public PatientResponseDto createPatient(PatientRequestDto patientDto) {
        log.info("Criando novo paciente: {}", patientDto.getEmail());
        LocalDate birthDate = helper.parseBirthDate(patientDto.getBirthDate());

        User user = new User();
        // Nota: Idealmente use um Mapper ou Builder aqui para limpar o código
        user.setName(patientDto.getName());
        user.setEmail(patientDto.getEmail());
        user.setCpf(patientDto.getCpf());
        user.setCep(patientDto.getCep());
        user.setPhone(patientDto.getPhone());
        user.setBirthDate(birthDate);
        user.setCreatedByAdmin(true);

        try {
            User savedUser = userRepository.save(user);
            cacheService.delete(CACHE_KEY_ALL_PATIENTS); // Invalida cache da lista completa

            // Gera o token de criação de senha para o novo usuário.
            passwordCreationTokenService.createAndSaveToken(savedUser);

            return mapper.toDto(savedUser);
        } catch (DataAccessException e) {
            if (e.getMessage() != null && e.getMessage().contains("ConstraintViolationException")) {
                throw new BusinessRuleException("Email ou CPF já cadastrado.", e);
            }
            throw new DatabaseOperationException("Erro ao salvar paciente", e);
        }
    }

    @Override
    @Transactional
    public PatientResponseDto updatePatient(String id, PatientRequestDto patientDto) {
        log.info("Atualizando paciente ID: {}", id);
        User user = helper.findPatientByPublicId(id);
        LocalDate birthDate = helper.parseBirthDate(patientDto.getBirthDate());

        mapper.updateEntity(patientDto, user, birthDate);

        try {
            User updatedUser = userRepository.save(user);
            cacheService.delete(CACHE_KEY_ALL_PATIENTS);
            return mapper.toDto(updatedUser);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao atualizar paciente", e);
        }
    }

    @Override
    @Transactional
    public void deletePatient(String id) {
        log.info("Deletando paciente ID: {}", id);
        User user = helper.findPatientByPublicId(id);
        helper.validatePatientHasNoAppointments(user);

        try {
            userRepository.deleteByPublicId(user.getPublicId());
            cacheService.delete(CACHE_KEY_ALL_PATIENTS);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao deletar paciente", e);
        }
    }
}