package br.edu.fatecpg.usafa.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;

@Repository
public interface IConsultaRepository extends JpaRepository<Consulta, Long> {

    /**
     * Busca todas as consultas de um usuário específico,
     * ordenadas pela data (dia) da consulta em ordem decrescente.
     */
    List<Consulta> findByUserOrderByDiaDesc(User user);
}
