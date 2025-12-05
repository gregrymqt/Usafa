package br.edu.fatecpg.usafa.features.consulta.repositories;

import br.edu.fatecpg.usafa.models.SolicitacaoConsulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface ISolicitacaoConsultaRepository extends JpaRepository<SolicitacaoConsulta, Long> {
    Page<SolicitacaoConsulta> findByUser_PublicIdAndStatus(UUID userPublicId, String status, Pageable pageable);
    Page<SolicitacaoConsulta> findByUser_PublicId(UUID userPublicId, Pageable pageable);
    Page<SolicitacaoConsulta> findByStatus(String status, Pageable pageable);
    
    // [NOVO] Essencial para edição segura sem expor ID numérico
    // Assumindo que você tem um campo 'publicId' na SolicitacaoConsulta. 
    // Se não tiver, use findById(Long) mas faça o parse com cuidado no Service.
    // O ideal é ter PublicId (UUID) em tudo.
    Optional<SolicitacaoConsulta> findByPublicId(UUID publicId);
}