package br.edu.fatecpg.usafa.features.admin.services.Home;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
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

    private static final String CACHE_KEY_ALL = "home:content:all";

    @Override
    public List<HomeContentDto> findAll() {
        if (cacheService.exists(CACHE_KEY_ALL)) {
            return cacheService.get(CACHE_KEY_ALL, List.class);
        }

        List<HomeContentDto> dtos = repository.findAll().stream()
                .map(homeMapper::toDto)
                .collect(Collectors.toList());

        cacheService.saveWithTtl(CACHE_KEY_ALL, dtos, 1, TimeUnit.HOURS);
        return dtos;
    }

    @Override
    public List<HomeContentDto> findByType(ContentType type) {
        return repository.findByTypeAndIsActiveTrue(type).stream()
                .map(homeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HomeContentDto create(String title, String description, String typeStr, Boolean isActive, MultipartFile file) {
        // 1. Validação de Tipo
        ContentType type;
        try {
            type = ContentType.valueOf(typeStr);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("Tipo de conteúdo inválido: " + typeStr);
        }

        // 2. Upload da Imagem (Delegado para o PictureService)
        Picture picture = null;
        if (file != null && !file.isEmpty()) {
            // Assumindo que o serviço de imagem pode retornar a entidade Picture
            picture = pictureService.uploadAndGetPicture(file, type.name());
        }

        // 3. Criação da Entidade
        HomeContent entity = HomeContent.builder()
                .title(title)
                .description(description)
                .type(type)
                .isActive(isActive != null ? isActive : true)
                .picture(picture)
                .build();

        HomeContent saved = repository.save(entity);
        cacheService.delete(CACHE_KEY_ALL);

        return homeMapper.toDto(saved);
    }

    @Override
    @Transactional
    public HomeContentDto update(Long id, String title, String description, String typeStr, Boolean isActive, MultipartFile file) {
        HomeContent entity = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Conteúdo não encontrado com ID: " + id));

        if (title != null) entity.setTitle(title);
        if (description != null) entity.setDescription(description);
        if (isActive != null) entity.setIsActive(isActive);

        if (typeStr != null) {
            try {
                entity.setType(ContentType.valueOf(typeStr));
            } catch (IllegalArgumentException e) {
                throw new BusinessRuleException("Tipo inválido");
            }
        }

        // Lógica de nova imagem (Delegado para o PictureService)
        if (file != null && !file.isEmpty()) {
            // Usa o tipo atual (ou novo) para definir a pasta
            Picture newPicture = pictureService.uploadAndGetPicture(file, entity.getType().name());
            entity.setPicture(newPicture);
        }

        HomeContent updated = repository.save(entity);
        cacheService.delete(CACHE_KEY_ALL);

        return homeMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Conteúdo não encontrado");
        }
        repository.deleteById(id);
        cacheService.delete(CACHE_KEY_ALL);
    }
}