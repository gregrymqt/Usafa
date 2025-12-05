package br.edu.fatecpg.usafa.features.consulta.dtos.Allow;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.util.List;

/**
 * Contêiner para os DTOs relacionados às opções de formulário.
 */
public class Options {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectOptionDTO {
        private String value; // ID
        private String label; // Nome visível
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormOptionsDTO {
        private List<SelectOptionDTO> medicos;
        private List<SelectOptionDTO> tipos;
        private List<SelectOptionDTO> dias; // ou slots
        private List<SelectOptionDTO> horarios;
    }
}
