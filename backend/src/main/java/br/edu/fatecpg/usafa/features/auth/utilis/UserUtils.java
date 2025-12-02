// br/edu/fatecpg/usafa/features/auth/utilis/UserUtils.java

package br.edu.fatecpg.usafa.features.auth.utilis;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // 1. Importar Logger
import org.slf4j.LoggerFactory; // 2. Importar LoggerFactory
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.auth.dtos.UserResponseDTO;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.roles.repositories.IRoleRepository;
import br.edu.fatecpg.usafa.models.Role;
// (Ajuste esses imports para seus models e repositórios corretos)
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;

import java.util.Arrays;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID; // 3. Importar UUID
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class UserUtils {

    private final IUserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserUtils.class);
    private final IRoleRepository roleRepository;
    private final ICacheService cacheService;

    private static final List<String> ADMIN_EMAILS = Arrays.asList(
            "lucasvicentedesouza021@gmail.com",
            "reisesdras36@gmail.com",
            "karinkarinbagietto@gmail.com",
            "Matsumotoygor2@gmail.com",
            "jcorjr04@gmail.com");

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

        return userRepository.findUserByEmail(email);
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

        // 1. Define uma chave única para o cache deste usuário
        final String cacheKey = "user:publicId:" + publicId;

        // 2. Tenta buscar o usuário do cache primeiro
        User cachedUser = cacheService.get(cacheKey, User.class);
        if (cachedUser != null) {
            // Cache HIT: Usuário encontrado no cache, retorna imediatamente
            logger.info("Cache HIT para o usuário com publicId: {}", publicId);
            return Optional.of(cachedUser);
        }

        // 3. Cache MISS: Usuário não está no cache, continua com a lógica original
        logger.info("Cache MISS para o usuário com publicId: {}. Buscando no banco de dados.", publicId);

        UUID uuid;
        try {
            uuid = UUID.fromString(publicId);
        } catch (IllegalArgumentException e) {
            logger.warn("Tentativa de busca com ID público inválido (não-UUID): {}", publicId);
            return Optional.empty();
        }

        // 4. Busca no repositório
        Optional<User> userFromDb = userRepository.findByPublicId(uuid);

        // 5. Se o usuário foi encontrado no banco, salva no cache antes de retornar
        if (userFromDb.isPresent()) {
            logger.info("Usuário com publicId: {} encontrado no banco. Salvando no cache.", publicId);
            // Salva no cache com um tempo de vida (TTL - Time To Live) de 1 hora, por
            // exemplo.
            // Ajuste o tempo conforme a necessidade da sua aplicação.
            cacheService.saveWithTtl(cacheKey, userFromDb.get(), 1, TimeUnit.HOURS);
        }

        return userFromDb;
    }

    // ---------------------------------------------------------
    // MÉTODOS PRIVADOS (HELPERS)
    // ---------------------------------------------------------

    public void assignDefaultRole(User user) {
        if (ADMIN_EMAILS.contains(user.getEmail())) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseThrow(() -> new BusinessRuleException("Erro interno: Role de ADMIN não configurada."));
            user.setRoles(Collections.singleton(adminRole));
        } else {
            Role defaultRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new BusinessRuleException("Erro interno: Role padrão não configurada."));
            user.setRoles(Collections.singleton(defaultRole));
        }
    }

    public boolean isProfileIncomplete(User user) {
        return user.getCpf() == null || user.getCpf().isBlank() ||
                user.getCep() == null || user.getCep().isBlank() ||
                user.getPhone() == null || user.getPhone().isBlank() ||
                user.getBirthDate() == null;
    }

    /**
     * Centraliza a criação do ResponseDTO para evitar código duplicado
     */
    public UserResponseDTO buildResponseDTO(User user, String token) {
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String birthDateFormatted = (user.getBirthDate() != null)
                ? user.getBirthDate().atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z"
                : null;

        return new UserResponseDTO(
                token,
                user.getPublicId().toString(),
                user.getName(),
                user.getEmail(),
                user.getCep(),
                user.getPhone(),
                birthDateFormatted,
                // CORREÇÃO: Adiciona a URL da imagem, tratando o caso de ser nula.
                user.getPicture() != null ? user.getPicture().getUrl() : null,
                roles);
    }
}