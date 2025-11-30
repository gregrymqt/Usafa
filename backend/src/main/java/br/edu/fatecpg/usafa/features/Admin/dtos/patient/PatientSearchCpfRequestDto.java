package br.edu.fatecpg.usafa.features.admin.dtos.patient;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PatientSearchCpfRequestDto {
    @NotBlank(message = "O CPF é obrigatório para a busca.")
    private String cpf;
}