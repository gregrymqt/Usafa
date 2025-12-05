package br.edu.fatecpg.usafa.features.admin.dtos.timeSlot;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SlotResponseDTO {

    private Long id;
    private String medicoId;
    private String dataHoraInicio;
    private String dataHoraFim;
    private String status;
}