package br.edu.fatecpg.usafa.features.auth.dtos;

/**
 * Este arquivo centraliza todos os Data Transfer Objects (DTOs) relacionados à autenticação.
 * Como todos são declarados sem o modificador 'public', eles são 'package-private'
 * e podem coexistir no mesmo arquivo .java.
 */


public record LoginRequestDTO(String email, String password) {}

