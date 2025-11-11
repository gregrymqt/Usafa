package br.edu.fatecpg.usafa.features.auth.dtos;

public record RegisterRequestDTO(String name, String email, String password, String cpf, String cep) {}

