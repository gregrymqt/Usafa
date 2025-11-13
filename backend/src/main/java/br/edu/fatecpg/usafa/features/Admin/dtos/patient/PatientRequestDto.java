package br.edu.fatecpg.usafa.features.Admin.dtos.patient;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PatientRequestDto {
    // Baseado em NewPatientData e UpdatePatientData [cite: 3]

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    @NotBlank(message = "O CPF é obrigatório")
    // Adicione validação de CPF se desejar (ex: @CPF da biblioteca)
    private String cpf;

    @NotBlank(message = "O telefone é obrigatório")
    private String phone;

    @NotBlank(message = "O cep é obrigatório")
    private String cep;

    @NotBlank(message = "A data de nascimento é obrigatória")
    private String birthDate; // Formato ISO "1990-10-25T00:00:00Z"

    // Se a criação de um paciente (User) exigir uma senha:
    // @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    // private String password;
}
