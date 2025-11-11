package br.edu.fatecpg.usafa.features.location.dtos;

import lombok.Data;

/**
 * DTO com os dados necessários para atualizar uma USAFA.
 * Corresponde ao 'locationData' de 'updateSavedLocation' no seu api.ts.
 */
@Data
public class LocationUpdateDTO {
    private String nome;
    private String cep;
}