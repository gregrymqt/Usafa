package br.edu.fatecpg.usafa.features.admin.dtos.patient.Password;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordCreationTokenRequestDto {

    /**
     * O ID público do usuário (paciente) para o qual o token será gerado.
     */
    @NotBlank(message = "O ID público do usuário não pode ser vazio.")
    private String userPublicId;

}