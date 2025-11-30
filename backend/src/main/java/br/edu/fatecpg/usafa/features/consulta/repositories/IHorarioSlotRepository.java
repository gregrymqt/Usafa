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

        // --- NOVA QUERY ---
    // Busca slots DISPONÍVEIS onde o médico pertence ao TipoConsulta solicitado
    // Estamos assumindo que HorarioSlot -> tem um Medico -> que tem um TipoConsulta (ou Especialidade)
    @Query("SELECT h FROM HorarioSlot h " +
           "JOIN h.medico m " +
           "JOIN m.tipoConsulta t " +
           "WHERE h.status = 'DISPONIVEL' " +
           "AND t.publicId = :tipoPublicId " +
           "ORDER BY h.dataHoraInicio ASC")
    List<HorarioSlot> findDisponiveisPorTipoConsulta(@Param("tipoPublicId") String tipoPublicId);
}

