package br.edu.fatecpg.usafa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.Medico;
import br.edu.fatecpg.usafa.models.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IConsultaRepository extends JpaRepository<Consulta, Long> {

    /**
     * Busca todas as consultas de um usuário específico,
     * ordenadas pela data (dia) da consulta em ordem decrescente.
     */
    List<Consulta> findByUserOrderByDiaDesc(User user);

    // Adicione estes métodos ao seu IConsultaRepository.java
    Optional<Consulta> findByPublicId(String publicId);

    boolean existsByMedicoAndDiaAndHorario(Medico medico, LocalDate dia, LocalTime horario);

    void deleteByPublicId(String publicId); // Mais eficiente que buscar e depois deletar

    boolean existsByPublicId(String publicId);

    boolean existsByUser(User user);
}
