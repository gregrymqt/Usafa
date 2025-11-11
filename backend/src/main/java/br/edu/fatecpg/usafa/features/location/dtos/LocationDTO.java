package br.edu.fatecpg.usafa.features.location.dtos;

import lombok.Builder;
import lombok.Data;

/**
 * DTO para representar os dados de uma USAFA que são enviados ao frontend.
 * Corresponde à interface 'SavedLocation' no seu api.ts.
 */
@Data
@Builder
public class LocationDTO {

    private Long id;
    private String userPublicId;
    private String nome;
    private String cep;
}