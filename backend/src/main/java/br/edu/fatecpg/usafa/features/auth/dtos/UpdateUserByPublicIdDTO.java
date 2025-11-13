package br.edu.fatecpg.usafa.features.auth.dtos;

public record UpdateUserByPublicIdDTO(String cep,
                                      String phone,
                                      String birthDate,
                                      String cpf) {

}
