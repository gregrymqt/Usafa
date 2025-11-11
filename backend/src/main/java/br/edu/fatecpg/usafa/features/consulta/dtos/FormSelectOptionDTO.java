package br.edu.fatecpg.usafa.features.consulta.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO genérico para opções de <select>
 * Mapeia a interface 'FormSelectOption' do front-end.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormSelectOptionDTO {
    private String value;
    private String label;
}
