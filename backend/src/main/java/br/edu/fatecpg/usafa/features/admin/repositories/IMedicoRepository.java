package br.edu.fatecpg.usafa.features.admin.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Medico;

@Repository
public interface IMedicoRepository extends JpaRepository<Medico, Long> {

    /**
     * Busca um médico pelo seu ID público.
     */
    Optional<Medico> findByPublicId(String publicId);

    /**
     * Busca médicos por nome ou CRM, ignorando maiúsculas/minúsculas, de forma paginada.
     * Usado para a funcionalidade de busca no painel de administração.
     */
    Page<Medico> findByNomeContainingIgnoreCaseOrCrmContainingIgnoreCase(String nome, String crm, Pageable pageable);

    /**
     * Verifica se já existe um médico com o CRM fornecido.
     */
    boolean existsByCrm(String crm);

    /**
     * Verifica se já existe um médico com o e-mail fornecido.
     */
    boolean existsByEmail(String email);

    /**
     * Busca um médico pelo seu CRM.
     */
    Optional<Medico> findByCrm(String crm);

}
