package br.edu.fatecpg.usafa.features.consulta.dtos;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * DTO para enviar as listas de opções para os <select> do formulário.
 * Mapeia a interface 'ConsultaFormOptions' do front-end.
 */
@Data
@Builder
public class ConsultaFormOptionsDTO {
    private List<FormSelectOptionDTO> medicos;
    private List<FormSelectOptionDTO> tipos;
    private List<FormSelectOptionDTO> dias;
    private List<FormSelectOptionDTO> horarios;
}
