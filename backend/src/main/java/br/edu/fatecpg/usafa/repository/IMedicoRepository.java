package br.edu.fatecpg.usafa.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Medico;

@Repository
public interface IMedicoRepository extends JpaRepository<Medico, Long> {

    /**
     * Busca um médico pelo seu ID público.
     */
    Optional<Medico> findByPublicId(String publicId);
}
