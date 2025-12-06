package br.edu.fatecpg.usafa.features.admin.services.Home;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentRequestDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Home.IHomeContentService;
import br.edu.fatecpg.usafa.features.admin.repositories.IHomeContentRepository;
import br.edu.fatecpg.usafa.features.admin.utils.home.HomeContentMapper;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.picture.interfaces.IPictureService;
import br.edu.fatecpg.usafa.models.HomeContent;
import br.edu.fatecpg.usafa.models.Picture;
import br.edu.fatecpg.usafa.models.enums.ContentType;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomeContentServiceImpl implements IHomeContentService {

    private final IHomeContentRepository repository;
    private final ICacheService cacheService;
    private final HomeContentMapper homeMapper;

    // Injeção do PictureService para lidar com imagens
    private final IPictureService pictureService;

    private static final String CACHE_KEY_PUBLIC = "home:content:public";

    @Override
    public List<HomeContentDto> findPublicContent() {
        if (cacheService.exists(CACHE_KEY_PUBLIC)) {
            return cacheService.get(CACHE_KEY_PUBLIC, List.class);
        }

        // Busca apenas os ATIVOS
        List<HomeContentDto> dtos = repository.findByIsActiveTrue().stream()
                .map(homeMapper::toDto)
                .collect(Collectors.toList());

        // Cache de 1 hora
        cacheService.saveWithTtl(CACHE_KEY_PUBLIC, dtos, 1, TimeUnit.HOURS);
        return dtos;
    }

    @Override
    public List<HomeContentDto> findAllForAdmin() {
        return repository.findAll().stream()
                .map(homeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HomeContentDto create(HomeContentRequestDto request, MultipartFile file) {
        // 1. Validação de Tipo
        ContentType type;
        try {
            type = ContentType.valueOf(request.getType());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Tipo de conteúdo inválido.");
        }

        // 2. Cria Entidade
        HomeContent entity = new HomeContent();
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setType(type);
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // 3. Lógica de Foto (Se houver arquivo, salva e vincula)
        if (file != null && !file.isEmpty()) {
            Picture picture = pictureService.uploadAndGetPicture(file, type.name());
            entity.setPicture(picture);
        }

        HomeContent saved = repository.save(entity);

        // INVALIDAÇÃO
        cacheService.delete(CACHE_KEY_PUBLIC);

        return homeMapper.toDto(saved);
    }

    @Override
@Transactional
public HomeContentDto update(Long id, HomeContentRequestDto request, MultipartFile file) {
    HomeContent entity = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Conteúdo não encontrado."));

    if (request.getTitle() != null) {
        entity.setTitle(request.getTitle());
    }
    
    if (request.getDescription() != null) {
        entity.setDescription(request.getDescription());
    }
    
    if (request.getType() != null) {
        // Se o tipo for String no DTO e Enum na Entity, faça a conversão:
        entity.setType(ContentType.valueOf(request.getType()));
    }

    if (request.getIsActive() != null) {
        entity.setIsActive(request.getIsActive());
    }
    // Atualiza Imagem
    if (file != null && !file.isEmpty()) {
        // [IMPLEMENTAÇÃO] Apaga a foto antiga do disco antes de trocar
        if (entity.getPicture() != null) {
            pictureService.delete(entity.getPicture().getId());
        }

        Picture newPicture = pictureService.uploadAndGetPicture(file, entity.getType().name());
        entity.setPicture(newPicture);
    }

        HomeContent updated = repository.save(entity);
        cacheService.delete(CACHE_KEY_PUBLIC);

        return homeMapper.toDto(updated);
    }

    @Override
@Transactional
public void delete(Long id) {
    HomeContent entity = repository.findById(id)
        .orElseThrow(() -> new NotFoundException("Conteúdo não encontrado"));

    // [IMPLEMENTAÇÃO] Antes de deletar o conteúdo, apague a foto associada do disco
    if (entity.getPicture() != null) {
        pictureService.delete(entity.getPicture().getId());
    }
        repository.deleteById(id);

        // INVALIDAÇÃO
        cacheService.delete(CACHE_KEY_PUBLIC);
    }
}