package br.edu.fatecpg.usafa.features.location.dtos;

import lombok.Builder;

/**
 * DTO para representar os dados de uma USAFA que são enviados ao frontend.
 * Corresponde à interface 'SavedLocation' no seu api.ts.
 */
@Builder
public record LocationDTO (Long id, String userPublicId, String nome, String cep) {}