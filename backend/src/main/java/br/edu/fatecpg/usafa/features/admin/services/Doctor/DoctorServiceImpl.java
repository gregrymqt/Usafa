package br.edu.fatecpg.usafa.features.admin.services.Doctor;

import java.util.concurrent.TimeUnit;

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
import br.edu.fatecpg.usafa.features.caching.page.PageCacheHelper;
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
    private final PageCacheHelper pageCacheHelper;

    @Override
    @Transactional(readOnly = true)
    public Page<DoctorResponseDto> getAllDoctors(Pageable pageable, String search) {

        // 1. Gera chave de cache única baseada na busca e página
        String safeSearch = (search != null && !search.trim().isEmpty()) ? search : "ALL";
        String cacheKey = String.format("DOCTORS:%s:%d:%d", safeSearch, pageable.getPageNumber(),
                pageable.getPageSize());

        // 2. Delega para o Helper Genérico (Resolve o problema de 'Abstract Page')
        return pageCacheHelper.getPageFromCacheOrDb(
                cacheKey,
                DoctorResponseDto.class,
                () -> {
                    // Lógica de busca no banco (Supplier)
                    if (!"ALL".equals(safeSearch)) {
                        return medicoRepository.searchActiveDoctors(search, pageable);
                    } else {
                        return medicoRepository.findByActiveTrue(pageable);
                    }
                },
                mapper::toDto, // Conversor
                10, TimeUnit.MINUTES // Cache
        );
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
        // Define padrão ativo se não vier no DTO
        medico.setActive(true);

        // Lógica de Foto
        if (file != null && !file.isEmpty()) {
            Picture picture = pictureService.uploadAndGetPicture(file, "doctor_profile");
            medico.setPicture(picture);
        }

        try {
            Medico savedMedico = medicoRepository.save(medico);
            invalidateDoctorCaches();
            return mapper.toDto(savedMedico);
        } catch (DataAccessException e) {
            log.error("Erro ao salvar médico: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao salvar médico", e);
        }
    }

    @Override
    @Transactional
    public DoctorResponseDto updateDoctor(String id, DoctorRequestDto doctorDto, MultipartFile file) {
        log.info("Atualizando médico ID: {}", id);

        Medico medico = helper.findDoctorByPublicId(id);

        // Validação de CRM único (se mudou)
        if (!medico.getCrm().equals(doctorDto.getCrm())) {
            medicoRepository.findByCrm(doctorDto.getCrm()).ifPresent(existing -> {
                throw new BusinessRuleException("Este CRM já pertence a outro médico.");
            });
        }

        // Atualiza dados básicos
        medico.setNome(doctorDto.getName());
        medico.setCrm(doctorDto.getCrm());
        medico.setEmail(doctorDto.getEmail());

        // Reativação Automática
        if (!medico.isActive()) {
            medico.setActive(true);
        }

        // Atualiza Especialidade
        if (!medico.getTipoConsulta().getPublicId().equals(doctorDto.getSpecialty())) {
            TipoConsulta novaEspec = helper.findSpecialtyByPublicId(doctorDto.getSpecialty());
            medico.setTipoConsulta(novaEspec);
        }

        // Atualiza Foto
        if (file != null && !file.isEmpty()) {
        // [IMPLEMENTAÇÃO] Apaga a foto antiga do disco se existir
        if (medico.getPicture() != null) {
            pictureService.delete(medico.getPicture().getId());
        }

        Picture newPicture = pictureService.uploadAndGetPicture(file, "doctor_profile");
        medico.setPicture(newPicture);
    }

        try {
            Medico updatedMedico = medicoRepository.save(medico);
            invalidateDoctorCaches();
            return mapper.toDto(updatedMedico);
        } catch (DataAccessException e) {
            log.error("Erro ao atualizar médico: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao atualizar médico", e);
        }
    }

    @Override
    @Transactional
    public void deleteDoctor(String id) {
        log.info("Iniciando inativação (Soft Delete) do médico ID: {}", id);

        // 1. Buscar entidade
        Medico medico = helper.findDoctorByPublicId(id);

        // 2. Validações (Ex: não pode inativar se tiver consultas pendentes, se for
        // regra de negócio)
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
            invalidateDoctorCaches();

            log.info("Médico ID {} inativado com sucesso.", id);

        } catch (DataAccessException e) {
            log.error("Erro de banco ao inativar médico: {}", e.getMessage());
            throw new DatabaseOperationException("Erro ao inativar o médico", e);
        }
    }

    private void invalidateDoctorCaches() {
        // Se o seu CacheService suportar pattern delete:
        cacheService.deletePattern("DOCTORS:*");

        // Ou deleta chaves específicas conhecidas/padrão
        cacheService.delete("FORM_OPTIONS_STATIC"); // Se médicos aparecerem no form de agendamento
    }
}
