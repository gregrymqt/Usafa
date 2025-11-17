package br.edu.fatecpg.usafa.features.consulta.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional; // <<< IMPORTAR OPTIONAL

import org.springframework.data.jpa.repository.JpaRepository;

import br.edu.fatecpg.usafa.models.HorarioSlot;
import br.edu.fatecpg.usafa.models.enums.StatusHorario;

public interface IHorarioSlotRepository extends JpaRepository<HorarioSlot, Long> {

    List<HorarioSlot> findByMedicoIdAndStatusAndDataHoraInicioBetween(
            Long medicoId, 
            StatusHorario status, 
            LocalDateTime inicio, 
            LocalDateTime fim
    );

    List<HorarioSlot> findByMedicoIdAndStatus(Long medicoId, StatusHorario status);
    
    boolean existsByMedicoIdAndDataHoraInicioBetween(
            Long medicoId, 
            LocalDateTime inicio, 
            LocalDateTime fim
    );

    // <<< MÉTODO ADICIONADO (NECESSÁRIO PELO ERRO)
    /**
     * Busca um slot de horário EXATO pelo médico e pela data/hora de início.
     * Usado pelo ConsultaService para travar um slot ao criar a consulta.
     */
    Optional<HorarioSlot> findByMedicoIdAndDataHoraInicio(Long medicoId, LocalDateTime dataHoraInicio); 
}