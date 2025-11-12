package br.edu.fatecpg.usafa.features.Admin.dtos.patient;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PatientResponseDto {

    // Usará o publicId da sua entidade User [cite: 48]
    private String id;

    private String name;
    private String email;
    private String cpf;

    // AVISO: Adicione 'phone' à sua entidade User.java [cite: 2]
    private String phone;

    // AVISO: Adicione 'birthDate' (como LocalDate ou String) à sua entidade User.java [cite: 2]
    private String birthDate; // Formato ISO "1990-10-25T00:00:00Z"
}
