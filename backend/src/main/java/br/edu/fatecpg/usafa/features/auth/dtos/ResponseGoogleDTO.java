// br/edu/fatecpg/usafa/features/auth/dtos/ResponseGoogleDTO.java
package br.edu.fatecpg.usafa.features.auth.dtos;

import java.util.List;

/**
 * DTO de resposta para o login do Google.
 *
 * @param token           Token JWT gerado.
 * @param publicId        ID público do usuário.
 * @param roles           Lista de papéis (roles).
 * @param isNewUser       Flag que indica se é o primeiro login (criação).
 * @param needsCompletion (NOVO) Flag que indica se o perfil precisa
 * ser completado (faltando CPF, CEP, etc.),
 * seja o usuário novo ou não.
 */
public record ResponseGoogleDTO(
        String token,
        String publicId,
        List<String> roles,
        boolean isNewUser,
        boolean needsCompletion // <-- NOVO CAMPO
) {
}