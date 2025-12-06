package br.edu.fatecpg.usafa.features.admin.services.Patient;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
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
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
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
    private final PageCacheHelper pageCacheHelper;
    private final UserUtils userUtils;

    private static final String CACHE_KEY_ALL_PATIENTS = "patients:all";

    /**
     * Busca paginada com filtro opcional por texto.
     * Não utiliza cache devido à dinamicidade dos parâmetros (página, tamanho,
     * busca).
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponseDto> getAllPatients(String search, Pageable pageable) {
        
        // 1. Gera chave única baseada nos filtros
        String safeSearch = (search != null && !search.trim().isEmpty()) ? search : "ALL";
        String cacheKey = String.format("PATIENTS:PAGE:%s:%d:%d", 
                safeSearch, pageable.getPageNumber(), pageable.getPageSize());

        // 2. Delega para o Helper
        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                PatientResponseDto.class,
                () -> {
                    // Lógica de Busca no Banco (Supplier)
                    if (!"ALL".equals(safeSearch)) {
                        return userRepository.searchPatients(search, pageable);
                    } else {
                        return userRepository.findAllPatients(pageable);
                    }
                },
                mapper::toDto,      // Conversor
                10, TimeUnit.MINUTES // Tempo de Cache
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> searchByCpf(String cpf) {
        // Busca pontual não costuma precisar de cache pesado, mas se quiser, pode adicionar.
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

        User user = helper.createPacient(patientDto, birthDate, true);

        try {
            User savedUser = userRepository.save(user);
            invalidatePatientCaches();

            // Gera o token de criação de senha para o novo usuário.
            passwordCreationTokenService.createAndSaveToken(savedUser);

            return mapper.toDto(savedUser);
        } catch (DataAccessException e) {
            // Verifica se é erro de integridade (duplicidade) independente da mensagem
            // exata
            if (e instanceof org.springframework.dao.DataIntegrityViolationException) {
                throw new BusinessRuleException("Erro: Email ou CPF já podem estar cadastrados.", e);
            }
            throw new DatabaseOperationException("Erro técnico ao salvar paciente", e);
        }
    }

    @Override
    @Transactional
    public PatientResponseDto updatePatient(String id, PatientRequestDto patientDto) {
        log.info("Atualizando paciente ID: {}", id);
        Optional<User> optionalUser = userUtils.getUserByPublicId(id);
        LocalDate birthDate = helper.parseBirthDate(patientDto.getBirthDate());

        mapper.updateEntity(patientDto, optionalUser.get(), birthDate);

        try {
            User updatedUser = userRepository.save(optionalUser.get());
            invalidatePatientCaches();
            return mapper.toDto(updatedUser);
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao atualizar paciente", e);
        }
    }

    @Override
    @Transactional
    public void deletePatient(String id) {
        log.info("Deletando paciente ID: {}", id);
        Optional<User> optionalUser = userUtils.getUserByPublicId(id);
        helper.validatePatientHasNoAppointments(optionalUser.get());

        try {
            userRepository.deleteByPublicId(optionalUser.get().getPublicId());
            invalidatePatientCaches();
        } catch (DataAccessException e) {
            throw new DatabaseOperationException("Erro ao deletar paciente", e);
        }
    }
    private void invalidatePatientCaches() {
        // 1. Remove a lista estática (usada em dropdowns)
        cacheService.delete(CACHE_KEY_ALL_PATIENTS);
        
        // 2. Remove todas as páginas cacheadas (ex: PATIENTS:PAGE:ALL:0:10, PATIENTS:PAGE:João:0:10)
        cacheService.deletePattern("PATIENTS:PAGE:*");
        
        log.info("Caches de pacientes invalidados com sucesso.");
    }

}