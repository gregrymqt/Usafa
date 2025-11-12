package br.edu.fatecpg.usafa.features.Admin.dtos.appointment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AppointmentRequestDto {
    // Baseado em NewAppointmentData e UpdateAppointmentData [cite: 35, 36]

    @NotBlank(message = "O ID do paciente é obrigatório")
    private String patientId; // O publicId do User [cite: 33]

    @NotBlank(message = "O ID do médico é obrigatório")
    private String doctorId; // O publicId do Medico [cite: 33]

    @NotBlank(message = "A data e hora são obrigatórias")
    private String dateTime; // Formato ISO "2023-12-25T14:30:00Z" 

    @NotBlank(message = "O status é obrigatório")
    private String status; // "Agendada", "Concluída", "Cancelada" 
}
