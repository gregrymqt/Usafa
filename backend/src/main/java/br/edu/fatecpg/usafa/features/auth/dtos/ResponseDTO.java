package br.edu.fatecpg.usafa.features.auth.dtos;

import java.util.List;

public record ResponseDTO(
    String token, 
    String publicId, 
    String name, 
    String email, 
    String cep,
    String phone,
    String birthDate,
    List<String> roles // <-- ADICIONE
) {}
