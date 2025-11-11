package br.edu.fatecpg.usafa.features.consulta.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para exibir o resumo da consulta recém-criada (o Modal)
 * Mapeia a interface 'ConsultaSummary' do front-end.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaSummaryDTO {

    // Nota: O front-end chama este campo de 'protocolo'
    // O Mapper deve converter "consulta.publicId" para "dto.protocolo"
    private String protocolo;

    private String medico;
    private String tipo;
    private String dia;
    private String horario;
    private String paciente;
    private String sintomas;
}
