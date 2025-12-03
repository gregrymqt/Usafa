package br.edu.fatecpg.usafa.features.consulta.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <<< IMPORTAR OPTIONAL

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;

public interface IHorarioSlotRepository extends JpaRepository<HorarioSlot, Long> {

    List<HorarioSlot> findByStatus(StatusHorario status);

    @Query("SELECT h FROM HorarioSlot h WHERE h.medico.publicId = :medicoPublicId AND h.dataHoraInicio = :dataHora")
        Optional<HorarioSlot> findByMedicoPublicIdAndDataHoraInicio(String medicoPublicId, LocalDateTime dataHora);

        // HorarioSlotRepository.java
@Query("SELECT h FROM HorarioSlot h " +
       "WHERE h.medico.tipoConsulta.publicId = :tipoId " + // O join mágico
       "AND h.status = 'DISPONIVEL' " +
       "AND h.dataHoraInicio > CURRENT_TIMESTAMP " + // Só horários futuros
       "ORDER BY h.dataHoraInicio ASC")
List<HorarioSlot> findDisponiveisPorTipoConsulta(@Param("tipoId") String tipoId);

    Optional<HorarioSlot> findByPublicId(String publicId);
}

