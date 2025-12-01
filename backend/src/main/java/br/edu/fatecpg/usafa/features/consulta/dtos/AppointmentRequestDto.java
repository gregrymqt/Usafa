package br.edu.fatecpg.usafa.features.consulta.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequestDto { // Ou ConsultaRequestDTO
    
    // O ID do paciente geralmente vem do Token (Security), 
    // mas se for Admin agendando, esse campo é útil.
    private String patientId; 

    @NotNull(message = "O Slot de horário é obrigatório")
    private Long horarioSlotId; // O Front envia isso!

    @NotEmpty(message = "O tipo de consulta é obrigatório")
    private String tipoConsultaId;

    private String sintomas;
}
