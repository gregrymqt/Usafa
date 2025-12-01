package br.edu.fatecpg.usafa.features.admin.controllers.Patient;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.utils.patient.PatientHelper;
import br.edu.fatecpg.usafa.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
     * POST /admin/password-tokens/generate/{userPublicId}
     *
     * @param userPublicId O ID público do usuário (paciente).
     * @return Um JSON contendo a URL completa para a criação da senha.
     */
    @PostMapping("/generate/{userPublicId}")
    public ResponseEntity<Map<String, String>> generateToken(@PathVariable String userPublicId) {
        // 1. Encontra o usuário pelo ID público para passar ao serviço
        User user = patientHelper.findPatientByPublicId(userPublicId);

        // 2. Chama o serviço para criar o token e obter a URL
        String creationUrl = tokenService.createAndSaveToken(user);

        // 3. Retorna a URL em um formato JSON amigável
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", creationUrl));
    }

    /**
     * Busca um token de criação de senha pelo ID público do usuário.
     * Permite verificar se um token existe e sua data de expiração.
     *
     * GET /admin/password-tokens/{userPublicId}
     *
     * @param userPublicId O ID público do usuário.
     * @return O documento do token se encontrado, ou 404 Not Found.
     */
    @GetMapping("/{userPublicId}")
    public ResponseEntity<PasswordCreationToken> getToken(@PathVariable String userPublicId) {
        return tokenService.findTokenByUserPublicId(userPublicId)
                .map(ResponseEntity::ok)
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