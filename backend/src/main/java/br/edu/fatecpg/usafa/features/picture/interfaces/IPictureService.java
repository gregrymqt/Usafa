package br.edu.fatecpg.usafa.features.picture.interfaces;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto;
import br.edu.fatecpg.usafa.models.Picture;

public interface IPictureService {
        PictureDto create(PictureDto pictureDto);

        PictureDto findById(Long id);

        List<PictureDto> findByGroup(String group);

        List<PictureDto> findByTitle(String title);

        List<PictureDto> findAll();

        PictureDto update(Long id, PictureDto pictureDto);

        void delete(Long id);

        // NOVO MÉTODO: Apenas salva o arquivo físico e retorna a URL
        Picture uploadAndGetPicture(MultipartFile file, String group);
}
