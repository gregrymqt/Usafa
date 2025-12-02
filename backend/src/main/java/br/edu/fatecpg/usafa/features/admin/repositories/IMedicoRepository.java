package br.edu.fatecpg.usafa.features.admin.repositories;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Medico;

@Repository
public interface IMedicoRepository extends JpaRepository<Medico, Long> {

    Optional<Medico> findByPublicId(String publicId);

    // [NOVO] Busca apenas médicos ATIVOS para a listagem padrão
    Page<Medico> findByActiveTrue(Pageable pageable);

    // [CORREÇÃO] Busca por Nome ou CRM, mas APENAS se estiverem ATIVOS
    @Query("SELECT m FROM Medico m WHERE m.active = true AND " +
           "(LOWER(m.nome) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.crm) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medico> searchActiveDoctors(String search, Pageable pageable);

    // Validações (CRM/Email) continuam verificando no banco todo (mesmo inativos)
    // para evitar duplicidade de cadastro histórico.
    boolean existsByCrm(String crm);
    boolean existsByEmail(String email);
    Optional<Medico> findByCrm(String crm);
}