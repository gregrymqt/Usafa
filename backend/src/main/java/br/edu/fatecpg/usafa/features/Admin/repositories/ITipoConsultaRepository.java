package br.edu.fatecpg.usafa.features.Admin.repositories;

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

    Optional<TipoConsulta> findByNome(String nome);
}
