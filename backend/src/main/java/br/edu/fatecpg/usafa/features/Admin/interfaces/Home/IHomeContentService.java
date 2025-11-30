package br.edu.fatecpg.usafa.features.admin.interfaces.Home;


import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.models.enums.ContentType;

import java.util.List;

public interface IHomeContentService {
    
    List<HomeContentDto> findAll(); // Retorna DTOs para o front

    List<HomeContentDto> findByType(ContentType type);

    HomeContentDto create(String title, String description, String typeStr, Boolean isActive, MultipartFile file);

    HomeContentDto update(Long id, String title, String description, String typeStr, Boolean isActive, MultipartFile file);

    void delete(Long id);
}