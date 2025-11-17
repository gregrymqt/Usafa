package br.edu.fatecpg.usafa.features.consulta.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.Consulta;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface IConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByUserOrderByHorarioSlotDataHoraInicioDesc(User user); 

    Optional<Consulta> findByPublicId(String publicId);

    void deleteByPublicId(String publicId); 

    boolean existsByPublicId(String publicId);

    boolean existsByUser(User user);
}