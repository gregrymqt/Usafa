package br.edu.fatecpg.usafa.features.admin.dtos.appointmentType;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AppointmentTypeRequestDto {
    @NotBlank(message = "O nome do tipo de consulta é obrigatório.")
    private String nome;
}