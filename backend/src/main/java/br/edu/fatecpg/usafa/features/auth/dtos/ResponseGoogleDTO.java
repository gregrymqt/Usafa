// br/edu/fatecpg/usafa/features/auth/dtos/ResponseGoogleDTO.java
package br.edu.fatecpg.usafa.features.auth.dtos;

import java.util.List;

// ADICIONE os campos 'roles' e 'isNewUser'
public record ResponseGoogleDTO(
    String token,
    String publicId,
    List<String> roles,
    boolean isNewUser
) {}