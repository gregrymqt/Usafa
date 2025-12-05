package br.edu.fatecpg.usafa.features.consulta.dtos.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUserResponseDTO {

    // O "protocolo" visual
    private String id; 

    // Dados legíveis (Strings pré-formatadas pelo backend)
    private String medicoNome;      
    private String especialidade;   
    private String data;    // ex: "20/11/2025"
    private String horario; // ex: "14:30"

    private String status;  
    private String sintomas;
}


