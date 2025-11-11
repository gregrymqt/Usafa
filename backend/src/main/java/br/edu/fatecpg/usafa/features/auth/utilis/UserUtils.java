// br/edu/fatecpg/usafa/features/auth/utilis/UserUtils.java

package br.edu.fatecpg.usafa.features.auth.utilis;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // 1. Importar Logger
import org.slf4j.LoggerFactory; // 2. Importar LoggerFactory
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

// (Ajuste esses imports para seus models e repositórios corretos)
import br.edu.fatecpg.usafa.models.User; 
import br.edu.fatecpg.usafa.repository.IUserRepository;

import java.util.Optional;
import java.util.UUID; // 3. Importar UUID

@Component
@RequiredArgsConstructor
public class UserUtils {

    private final IUserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserUtils.class);

    /**
     * Busca a entidade User com base na autenticação do Spring Security.
     * (Método que você já tinha)
     */
    public Optional<User> getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty(); // Não autorizado
        }

        String email = authentication.getName();
        if (email == null) {
            return Optional.empty();
        }
        
        return userRepository.findByEmail(email);
    }

    /**
     * NOVO MÉTODO
     * Busca a entidade User com base no seu ID público (UUID como String).
     *
     * @param publicId O ID público do usuário (em formato String).
     * @return Um Optional<User> contendo o usuário, se encontrado.
     */
    public Optional<User> getUserByPublicId(String publicId) {
        if (publicId == null || publicId.isEmpty()) {
            return Optional.empty();
        }

        UUID uuid;
        try {
            // 1. Tenta converter a String para UUID
            uuid = UUID.fromString(publicId);
        } catch (IllegalArgumentException e) {
            // 2. Se a string não for um UUID válido, loga e retorna vazio
            logger.warn("Tentativa de busca com ID público inválido (não-UUID): {}", publicId);
            return Optional.empty();
        }

        // 3. Busca no repositório com o UUID
        // (Assumindo que IUserRepository tem 'findByPublicId(UUID id)')
        return userRepository.findByPublicId(uuid);
    }
}