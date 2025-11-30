package br.edu.fatecpg.usafa.features.admin.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.TipoConsulta;

@Repository
public interface ITipoConsultaRepository extends JpaRepository<TipoConsulta, Long> {

    /**
     * Busca um tipo de consulta (especialidade) pelo seu ID público.
     */
    Optional<TipoConsulta> findByPublicId(String publicId);

   /**
     * Busca um tipo de consulta pelo nome, ignorando maiúsculas e minúsculas.
     * Isso é crucial para evitar duplicatas como "Cardiologia" e "cardiologia".
     */
    Optional<TipoConsulta> findByNomeIgnoreCase(String nome);
}
