package br.edu.fatecpg.usafa.features.consulta.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.User;

import java.util.Optional;

@Repository
public interface IConsultaRepository extends JpaRepository<Consulta, Long> {

    Page<Consulta> findByUser(User user, Pageable pageable);

    Optional<Consulta> findByPublicId(String publicId);

    void deleteByPublicId(String publicId);

    boolean existsByPublicId(String publicId);

    boolean existsByUser(User user);

    @Query("SELECT c FROM Consulta c WHERE " +
            "LOWER(c.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.user.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Consulta> searchConsultas(@Param("search") String search, Pageable pageable);

}