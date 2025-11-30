package br.edu.fatecpg.usafa.features.admin.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.HomeContent;
import br.edu.fatecpg.usafa.models.enums.ContentType;

import java.util.List;

@Repository
public interface IHomeContentRepository extends JpaRepository<HomeContent, Long> {
    
    // Busca tudo que está ativo (para o usuário final)
    List<HomeContent> findByIsActiveTrue();

    // Busca por tipo específico (ex: só serviços)
    List<HomeContent> findByTypeAndIsActiveTrue(ContentType type);
}