package br.edu.fatecpg.usafa.features.consulta.dtos;


import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * DTO para receber a requisição de nova consulta (o Formulário)
 * Mapeia a interface 'ConsultaRequest' do front-end.
 */
@Data
public class ConsultaRequestDTO {

    @NotEmpty(message = "O ID do médico é obrigatório.")
    private String medicoId; // publicId do Medico

    @NotEmpty(message = "O ID do tipo de consulta é obrigatório.")
    private String tipoId; // publicId (ou ID) do TipoConsulta

    @NotEmpty(message = "O dia é obrigatório.")
    private String dia;

    @NotEmpty(message = "O horário é obrigatório.")
    private String horario;

    private String sintomas;
}
