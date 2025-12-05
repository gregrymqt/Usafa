package br.edu.fatecpg.usafa.features.consulta.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <<< IMPORTAR OPTIONAL

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;

@Repository
public interface IHorarioSlotRepository extends JpaRepository<HorarioSlot, Long> {

    List<HorarioSlot> findByStatus(StatusHorario status);

    // CORREÇÃO: Adicionados @Param para vincular com :medicoPublicId e :dataHora
    @Query("SELECT h FROM HorarioSlot h WHERE h.medico.publicId = :medicoPublicId AND h.dataHoraInicio = :dataHora")
    Optional<HorarioSlot> findByMedicoPublicIdAndDataHoraInicio(
        @Param("medicoPublicId") String medicoPublicId, 
        @Param("dataHora") LocalDateTime dataHora
    );

    @Query("SELECT h FROM HorarioSlot h " +
            "WHERE h.medico.tipoConsulta.publicId = :tipoId " +
            "AND h.status = 'DISPONIVEL' " +
            "AND h.dataHoraInicio > CURRENT_TIMESTAMP " +
            "ORDER BY h.dataHoraInicio ASC")
    List<HorarioSlot> findDisponiveisPorTipoConsulta(@Param("tipoId") String tipoId);

    Optional<HorarioSlot> findByPublicId(String publicId);
}