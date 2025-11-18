package br.edu.fatecpg.usafa.features.consulta.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <<< IMPORTAR OPTIONAL

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;

public interface IHorarioSlotRepository extends JpaRepository<HorarioSlot, Long> {

    List<HorarioSlot> findByMedicoIdAndStatus(Long medicoId, StatusHorario status);

    // <<< MÉTODO ADICIONADO (NECESSÁRIO PELO ERRO)
    /**
     * Busca um slot de horário EXATO pelo médico e pela data/hora de início.
     * Usado pelo ConsultaService para travar um slot ao criar a consulta.
     */
    Optional<HorarioSlot> findByMedicoIdAndDataHoraInicio(Long medicoId, LocalDateTime dataHoraInicio); 


    List<HorarioSlot> findByStatus(StatusHorario status);

    @Query("SELECT h FROM HorarioSlot h WHERE h.medico.publicId = :medicoPublicId AND h.dataHoraInicio = :dataHora")
        Optional<HorarioSlot> findByMedicoPublicIdAndDataHoraInicio(String medicoPublicId, LocalDateTime dataHora);

}