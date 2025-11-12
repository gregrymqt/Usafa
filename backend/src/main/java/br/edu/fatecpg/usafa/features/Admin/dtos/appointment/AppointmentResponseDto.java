package br.edu.fatecpg.usafa.features.Admin.dtos.appointment;

import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AppointmentResponseDto {

    // Usará o publicId da sua entidade Consulta [cite: 38]
    private String id;

    // O front-end espera o objeto Paciente aninhado [cite: 30]
    private PatientResponseDto patient;

    // O front-end espera o objeto Doutor aninhado [cite: 30]
    private DoctorResponseDto doctor;

    // O front-end espera uma data/hora ISO [cite: 31]
    // Você precisará combinar 'dia' e 'horario' da entidade Consulta
    private String date; // Ex: "2023-12-25T14:30:00Z"

    // O front-end espera o status como String [cite: 32]
    // Mapeia do Consulta.status (Enum) para String [cite: 43]
    private String status; // "Agendada", "Concluída", "Cancelada"
}
