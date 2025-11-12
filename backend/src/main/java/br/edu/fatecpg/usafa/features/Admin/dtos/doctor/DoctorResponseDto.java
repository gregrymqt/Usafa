package br.edu.fatecpg.usafa.features.Admin.dtos.doctor;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DoctorResponseDto {

    // Usará o publicId da sua entidade Medico [cite: 45]
    private String id;

    // Mapeia do 'nome' da entidade Medico 
    private String name;

    // AVISO: Adicione 'email' à sua entidade Medico.java 
    private String email;

    // AVISO: Adicione 'crm' à sua entidade Medico.java 
    private String crm;

    // Mapeia de Medico.tipoConsulta.getNome() [cite: 20, 46]
    private String specialty;
}
