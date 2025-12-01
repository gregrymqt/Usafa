package br.edu.fatecpg.usafa.features.admin.controllers.Patient;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PasswordCreationTokenRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PasswordCreationTokenResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.utils.patient.PatientHelper;
import br.edu.fatecpg.usafa.models.User;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin/password-tokens")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class PasswordCreationTokenController {

    private final IPasswordCreationTokenService tokenService;
    private final PatientHelper patientHelper; // Reutilizando o helper para buscar o usuário

    /**
     * Gera um novo token e link de criação de senha para um usuário.
     * Este endpoint é útil para reenviar o link caso o usuário o perca.
     *
     * POST /admin/password-tokens/generate
     *
     * @param requestDto DTO contendo o ID público do usuário (paciente).
     * @return Um DTO de resposta com a URL de criação e a data de expiração.
     */
    @PostMapping("/generate")
    public ResponseEntity<PasswordCreationTokenResponseDto> generateToken(@Valid @RequestBody PasswordCreationTokenRequestDto requestDto) {
        // 1. Encontra o usuário pelo ID público para passar ao serviço
        User user = patientHelper.findPatientByPublicId(requestDto.getUserPublicId());

        // 2. Chama o serviço para criar o token
        Optional<PasswordCreationToken> token = tokenService.createAndSaveToken(user);

        // 3. Mapeia a entidade para o DTO de resposta
        PasswordCreationTokenResponseDto response = PasswordCreationTokenResponseDto.builder()
                .url(token.get().getUrl())
                .expiryDate(token.get().getExpiryDate())
                .build();

        // 4. Retorna o DTO de resposta
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Busca um token de criação de senha pelo ID público do usuário.
     * Permite verificar se um token existe e sua data de expiração.
     *
     * GET /admin/password-tokens/{userPublicId}
     *
     * @param userPublicId O ID público do usuário.
     * @return O DTO de resposta do token se encontrado, ou 404 Not Found.
     */
    @GetMapping("/{userPublicId}")
    public ResponseEntity<PasswordCreationTokenResponseDto> getToken(@PathVariable String userPublicId) {
        return tokenService.findTokenByUserPublicId(userPublicId)
                .map(token -> {
                    PasswordCreationTokenResponseDto responseDto = PasswordCreationTokenResponseDto.builder()
                            .url(token.getUrl())
                            .expiryDate(token.getExpiryDate())
                            .build();
                    return ResponseEntity.ok(responseDto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deleta um token de criação de senha, invalidando o link associado.
     *
     * DELETE /admin/password-tokens/{userPublicId}
     *
     * @param userPublicId O ID público do usuário cujo token será deletado.
     * @return 204 No Content.
     */
    @DeleteMapping("/{userPublicId}")
    public ResponseEntity<Void> deleteToken(@PathVariable String userPublicId) {
        tokenService.deleteToken(userPublicId);
        return ResponseEntity.noContent().build();
    }
}