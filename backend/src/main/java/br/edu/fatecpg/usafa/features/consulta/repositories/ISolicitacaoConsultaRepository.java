package br.edu.fatecpg.usafa.features.consulta.repositories;

import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ISolicitacaoConsultaRepository extends JpaRepository<SolicitacaoConsulta, Long> {

    /**
     * Busca uma página de solicitações de consulta para um usuário específico,
     * filtrando por um status. A busca é feita pelo ID público do usuário.
     *
     * @param userPublicId O ID público do usuário.
     * @param status O status da solicitação (ex: "PENDENTE", "CONFIRMADA").
     * @param pageable Objeto de paginação.
     * @return Uma página de solicitações de consulta.
     */
    Page<SolicitacaoConsulta> findByUser_PublicIdAndStatus(UUID userPublicId, String status, Pageable pageable);

    /**
     * Busca todas as solicitações de consulta de um usuário específico, independente do status.
     */
    Page<SolicitacaoConsulta> findByUser_PublicId(UUID userPublicId, Pageable pageable);

    /**
     * Busca uma página de solicitações de consulta filtrando apenas pelo status.
     * Útil para a visão do administrador.
     *
     * @param status O status da solicitação (ex: "PENDENTE", "CONFIRMADA").
     * @param pageable Objeto de paginação.
     * @return Uma página de solicitações de consulta.
     */
    Page<SolicitacaoConsulta> findByStatus(String status, Pageable pageable);
}