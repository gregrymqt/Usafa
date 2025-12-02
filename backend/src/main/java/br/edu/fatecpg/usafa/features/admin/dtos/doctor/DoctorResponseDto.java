package br.edu.fatecpg.usafa.features.admin.dtos.doctor;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DoctorResponseDto {

    private String id;
    private String name;
    private String email;
    private String crm;
    
    // Mantém este para exibir o NOME na tabela
    private String specialty; 

    // ADICIONE ESTE para o formulário saber o ID
    private String specialtyId; 

    private String picture;
}