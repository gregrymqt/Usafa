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

    // Repositórios e Serviços principais
    private final IMedicoRepository medicoRepository;
    private final ICacheService cacheService;
    private final IPictureService pictureService;

    // Classes auxiliares
    private final DoctorHelper helper;
    private final DoctorMapper mapper;

    private static final String CACHE_KEY_ALL_DOCTORS = "doctors:all";

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDto> getAllDoctors(Pageable pageable, String search) {
        log.info("Buscando médicos com paginação: {}, termo de busca: '{}'", pageable, search);

        try {
            Page<Medico> medicosPage;

            // Se houver um termo de busca, filtra por nome ou CRM
            if (search != null && !search.trim().isEmpty()) {
                log.info("Realizando busca por '{}'", search);
                // Você precisará criar este método no seu IMedicoRepository
                medicosPage = medicoRepository.findByNomeContainingIgnoreCaseOrCrmContainingIgnoreCase(search, search, pageable);
            } else {
                // Senão, busca todos os médicos de forma paginada
                log.info("Buscando todos os médicos paginados");
                medicosPage = medicoRepository.findAll(pageable);
            }

            // Mapeia a página de entidades para uma página de DTOs
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

        TipoConsulta especialidade = helper.findSpecialtyByName(doctorDto.getSpecialty());

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

        Medico medico = helper.findDoctorByPublicId(id);

        medicoRepository.findByCrm(doctorDto.getCrm()).ifPresent(existing -> {
            if (!existing.getPublicId().equals(id)) {
                throw new BusinessRuleException("Este CRM já pertence a outro médico.");
            }
        });

        medico.setNome(doctorDto.getName());
        medico.setCrm(doctorDto.getCrm());
        medico.setEmail(doctorDto.getEmail());

        // Atualiza Especialidade se mudou
        if (!medico.getTipoConsulta().getNome().equalsIgnoreCase(doctorDto.getSpecialty())) {
            TipoConsulta novaEspec = helper.findSpecialtyByName(doctorDto.getSpecialty());
            medico.setTipoConsulta(novaEspec);
        }

        // Lógica de Foto
        if (file != null && !file.isEmpty()) {
            // Se já tinha foto, pode deletar a antiga do bucket ou apenas substituir a URL
            // Aqui assumo substituição do objeto Picture
            Picture newPicture = pictureService.uploadAndGetPicture(file, "doctor_profile");
            medico.setPicture(newPicture);
        }

        try {
            Medico updatedMedico = medicoRepository.save(medico);
            cacheService.delete(CACHE_KEY_ALL_DOCTORS);
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
