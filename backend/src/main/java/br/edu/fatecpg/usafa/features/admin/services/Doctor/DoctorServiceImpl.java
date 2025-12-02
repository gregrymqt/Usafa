package br.edu.fatecpg.usafa.features.admin.services.Doctor;

import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Doctor.IDoctorService;
import br.edu.fatecpg.usafa.features.admin.repositories.IMedicoRepository;
import br.edu.fatecpg.usafa.features.admin.utils.doctor.DoctorHelper;
import br.edu.fatecpg.usafa.features.admin.utils.doctor.DoctorMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.picture.interfaces.IPictureService;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.TipoConsulta;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorServiceImpl implements IDoctorService {

    private final IMedicoRepository medicoRepository;
    private final ICacheService cacheService;
    private final IPictureService pictureService;
    private final DoctorHelper helper;
    private final DoctorMapper mapper;

    private static final String CACHE_KEY_ALL_DOCTORS = "doctors:all";

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDto> getAllDoctors(Pageable pageable, String search) {
        log.info("Buscando médicos ativos. Paginação: {}, termo de busca: '{}'", pageable, search);
        try {
            Page<Medico> medicosPage;

            // 1. Lógica de Busca (Apenas Ativos)
            if (search != null && !search.trim().isEmpty()) {
                log.info("Realizando busca por '{}' em médicos ativos", search);
                // Precisa ter este método no Repository:
                // @Query("SELECT m FROM Medico m WHERE m.active = true AND (LOWER(m.nome) LIKE ... OR LOWER(m.crm) LIKE ...)")
                medicosPage = medicoRepository.searchActiveDoctors(search, pageable);
            } else {
                log.info("Listando todos os médicos ativos");
                // Precisa ter este método no Repository: Page<Medico> findByActiveTrue(Pageable pageable);
                medicosPage = medicoRepository.findByActiveTrue(pageable); 
            }

            return medicosPage.map(mapper::toDto);

        } catch (DataAccessException e) {
            log.error("Erro de banco de dados ao buscar médicos: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao buscar médicos", e);
        }
    }

    @Override
    @Transactional
    public DoctorResponseDto createDoctor(DoctorRequestDto doctorDto, MultipartFile file) {
        log.info("Criando novo médico CRM: {}", doctorDto.getCrm());
        
        if (medicoRepository.existsByCrm(doctorDto.getCrm())) {
            throw new BusinessRuleException("Já existe um médico cadastrado com este CRM.");
        }
        if (medicoRepository.existsByEmail(doctorDto.getEmail())) {
            throw new BusinessRuleException("Este e-mail já está em uso.");
        }

        TipoConsulta especialidade = helper.findSpecialtyByPublicId(doctorDto.getSpecialty());

        Medico medico = new Medico();
        medico.setNome(doctorDto.getName());
        medico.setEmail(doctorDto.getEmail());
        medico.setCrm(doctorDto.getCrm());
        medico.setTipoConsulta(especialidade);

        // Lógica de Foto
        if (file != null && !file.isEmpty()) {
            Picture picture = pictureService.uploadAndGetPicture(file, "doctor_profile");
            medico.setPicture(picture);
        }

        try {
            Medico savedMedico = medicoRepository.save(medico);
            cacheService.delete(CACHE_KEY_ALL_DOCTORS);
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
    public DoctorResponseDto updateDoctor(String id, DoctorRequestDto doctorDto, MultipartFile file) {
        log.info("Atualizando médico ID: {}", id);
        
        // Busca o médico (mesmo se estiver inativo, pois estamos editando pelo ID)
        Medico medico = helper.findDoctorByPublicId(id);

        // Validação de CRM único
        medicoRepository.findByCrm(doctorDto.getCrm()).ifPresent(existing -> {
            if (!existing.getPublicId().equals(id)) {
                throw new BusinessRuleException("Este CRM já pertence a outro médico.");
            }
        });

        // Atualiza dados básicos
        medico.setNome(doctorDto.getName());
        medico.setCrm(doctorDto.getCrm());
        medico.setEmail(doctorDto.getEmail());

        // [LÓGICA NOVA] Reativação Automática
        // Se o médico estava "Excluído" (active=false) e foi editado, entendemos que ele deve voltar a ser ativo.
        if (!medico.isActive()) {
            log.info("Reativando médico previamente inativo: {}", medico.getNome());
            medico.setActive(true);
        }

        // Atualiza Especialidade
        if (!medico.getTipoConsulta().getPublicId().equalsIgnoreCase(doctorDto.getSpecialty())) {
            TipoConsulta novaEspec = helper.findSpecialtyByPublicId(doctorDto.getSpecialty());
            medico.setTipoConsulta(novaEspec);
        }

        // Atualiza Foto
        if (file != null && !file.isEmpty()) {
            Picture newPicture = pictureService.uploadAndGetPicture(file, "doctor_profile");
            medico.setPicture(newPicture);
        }

        try {
            Medico updatedMedico = medicoRepository.save(medico);
            cacheService.delete(CACHE_KEY_ALL_DOCTORS);
            return mapper.toDto(updatedMedico);

        } catch (DataAccessException e) {
            log.error("Erro ao atualizar médico: {}", e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("ConstraintViolationException")) {
                throw new BusinessRuleException("Email ou CRM já cadastrado.", e);
            }
            throw new DatabaseOperationException("Erro ao atualizar médico", e);
        }
    }

   @Override
    @Transactional
    public void deleteDoctor(String id) {
        log.info("Iniciando inativação (Soft Delete) do médico ID: {}", id);
        
        // 1. Buscar entidade
        Medico medico = helper.findDoctorByPublicId(id);

        // 2. Validações (Ex: não pode inativar se tiver consultas pendentes, se for regra de negócio)
        helper.validateDoctorHasNoAppointments(medico);

        try {
            // 3. "Deleta" (Inativa)
            medico.setActive(false);

            // 4. Limpa agenda futura (Slots livres)
            // Isso garante que ele não apareça para agendamento, mesmo se o filtro falhar
            if (medico.getHorarios() != null) {
                medico.getHorarios().clear();
            }

            medicoRepository.saveAndFlush(medico);
            cacheService.delete(CACHE_KEY_ALL_DOCTORS);
            
            log.info("Médico ID {} inativado com sucesso.", id);

        } catch (DataAccessException e) {
            log.error("Erro de banco ao inativar médico: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao inativar o médico", e);
        }
    }
}
