package br.edu.fatecpg.usafa.features.location.dtos;

import lombok.Data;

/**
 * DTO com os dados necessários para criar uma nova USAFA.
 * Corresponde ao payload de 'createSavedLocation' no seu api.ts.
 */
@Data
public class LocationCreateDTO {

    private String userPublicId; // ID público do usuário que está salvando
    private String nome;
    private String cep;
}