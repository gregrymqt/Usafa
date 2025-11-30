package br.edu.fatecpg.usafa.features.picture.repository;

import br.edu.fatecpg.usafa.models.Picture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPictureRepository extends JpaRepository<Picture, Long> {

    /**
     * Busca todas as imagens que pertencem a um grupo específico.
     */
    List<Picture> findByGroup(String group);

    List<Picture> findByTitleContainingIgnoreCase(String title);
}
