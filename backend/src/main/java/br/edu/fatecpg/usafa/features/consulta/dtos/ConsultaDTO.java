package br.edu.fatecpg.usafa.features.consulta.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para exibir a lista de consultas (a Tabela)
 * Mapeia a interface 'Consulta' do front-end.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaDTO {

    // Nota: O front-end chama este campo de 'id'
    // O Mapper deve converter "consulta.publicId" para "dto.id"
    private String id; 

    private String medico; // (ex: "Dr. João Silva")
    private String tipo;   // (ex: "Cardiologia")
    private String dia;    // (ex: "20/11/2025")
    private String horario; // (ex: "10:00")
    private String status;  // (ex: "Confirmada")
}
