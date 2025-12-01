package br.edu.fatecpg.usafa.features.admin.interfaces.Home;


import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentRequestDto;

import java.util.List;

public interface IHomeContentService {
    

    HomeContentDto create(HomeContentRequestDto request, MultipartFile file);

    HomeContentDto update(Long id, HomeContentRequestDto request, MultipartFile file);

    void delete(Long id);

    List<HomeContentDto> findAllForAdmin();

    List<HomeContentDto> findPublicContent();
}