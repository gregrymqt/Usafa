package br.edu.fatecpg.usafa.features.admin.services.Patient;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.CreatePasswordDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.repositories.IPasswordCreationTokenRepository;
import br.edu.fatecpg.usafa.features.auth.dtos.UserResponseDTO;
import br.edu.fatecpg.usafa.features.auth.repositories.IUserRepository;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordCreationTokenServiceImpl implements IPasswordCreationTokenService {

    private final IUserRepository userRepository;
    private final IPasswordCreationTokenRepository tokenRepository;
    private final ICacheService cacheService;
    private final UserUtils userUtils;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.create-password-url}")
    private String createPasswordBaseUrl;

    private static final String CACHE_PREFIX = "auth:password-token:";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    /**
     * Cria e salva um novo token na tabela dedicada.
     */
    @Transactional
    public Optional<PasswordCreationToken> createAndSaveToken(User user) {
        if (user == null || user.getPublicId() == null) {
            log.error("Tentativa de criar token para um usuário nulo ou sem publicId.");
            throw new BusinessRuleException("Usuário inválido para criação de token.");
        }

        final String userPublicId = user.getPublicId().toString();

        // 1. Verifica se já existe um token válido no banco SQL
        Optional<PasswordCreationToken> existingTokenOpt = tokenRepository.findByUserAndExpiryDateAfter(user,
                LocalDateTime.now());

        if (existingTokenOpt.isPresent()) {
            log.info("Token válido já existe na tabela para: {}. Reutilizando.", userPublicId);
            PasswordCreationToken existingToken = existingTokenOpt.get();
            // Reconstrói a URL (pois não é salva no banco)
            existingToken.setFullUrl(createPasswordBaseUrl + existingToken.getToken());
            return Optional.of(existingToken);
        }

        log.info("Gerando novo token de criação de senha para: {}", userPublicId);
        String newTokenString = UUID.randomUUID().toString();
        String fullUrl = createPasswordBaseUrl + newTokenString;
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        try {
            if (tokenRepository.existsByUser(user)) {
                tokenRepository.deleteByUser(user);
                tokenRepository.flush();
            }

            // 3. Cria e Salva o novo
            PasswordCreationToken newToken = new PasswordCreationToken(newTokenString, fullUrl);
            newToken.setUser(user);
            newToken.setExpiryDate(expiryDate);

            PasswordCreationToken savedToken = tokenRepository.save(newToken);

            // 4. Salva no Cache
            String cacheKey = CACHE_PREFIX + userPublicId;
            cacheService.saveWithTtl(cacheKey, savedToken, TOKEN_EXPIRATION_HOURS, TimeUnit.HOURS);

            return Optional.of(savedToken);

        } catch (DataAccessException e) {
            log.error("Erro ao salvar token SQL: {}", userPublicId, e);
            throw new DatabaseOperationException("Falha ao salvar o token de senha.", e);
        }
    }

    /**
     * [NOVA LÓGICA] Define a senha do usuário e inativa o token utilizado.
     */
    @Transactional
    public void createPassword(CreatePasswordDTO createPasswordDto) {
        // 1. Busca o token no banco
        PasswordCreationToken token = tokenRepository.findByToken(createPasswordDto.token())
                .orElseThrow(() -> new BusinessRuleException("Token inválido ou não encontrado."));

        // 2. Validações de Segurança
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Este link expirou.");
        }
        if (!token.isActive()) { // [LÓGICA PEDIDA] Verifica se já foi usado (está false)
            throw new BusinessRuleException("Este link já foi utilizado.");
        }

        // 3. Define a nova senha no Usuário
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(createPasswordDto.password())); // Criptografa antes de salvar
        userRepository.save(user);

        // 4. Inativa o Token (active = false)
        token.setActive(false); // [LÓGICA PEDIDA] Muda de true para false
        tokenRepository.save(token);

        log.info("Senha criada com sucesso para o usuário ID: {}", user.getId());
    }

    public UserResponseDTO validateTokenAndGetUser(String tokenId) {

        // 1. Busca o Token pelo ID da tabela de tokens
        PasswordCreationToken token = tokenRepository.findByToken(tokenId)
                .orElseThrow(() -> new BusinessRuleException("Link inválido ou expirado."));

        // 2. Verifica se expirou
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException("Este link expirou.");
        }

        // 3. Pega o usuário associado a esse token
        User user = token.getUser();
        String tokenJwt = jwtUtils.generateToken(user);

        // 4. Retorna os dados que o Front precisa (Nome, Email, etc.)
        return userUtils.buildResponseDTO(user, tokenJwt);
    }

    /**
     * Busca o token.
     */
    public Optional<PasswordCreationToken> findTokenByUserPublicId(String userPublicId) {
        String cacheKey = CACHE_PREFIX + userPublicId;

        // 1. Tenta Cache
        PasswordCreationToken cachedToken = cacheService.get(cacheKey, PasswordCreationToken.class);
        if (cachedToken != null) {
            return Optional.of(cachedToken);
        }

        // 2. Tenta Banco SQL
        log.info("Cache Miss. Buscando token no SQL para: {}", userPublicId);
        try {   
            User user = userRepository.findByPublicId(UUID.fromString(userPublicId))
                    .orElseThrow(() -> new NotFoundException("Usuário não encontrado: " + userPublicId));

            // Busca usando o novo método do Repositório
            Optional<PasswordCreationToken> dbTokenOpt = tokenRepository.findByUser_Id(user.getId());

            dbTokenOpt.ifPresent(token -> {
                // [IMPORTANTE] Reconstruir a URL, pois o banco só tem o token hash
                token.setFullUrl(createPasswordBaseUrl + token.getToken());

                // Popula Cache se válido
                if (token.getExpiryDate().isAfter(LocalDateTime.now())) {
                    long hours = java.time.Duration.between(LocalDateTime.now(), token.getExpiryDate()).toHours();
                    if (hours > 0) {
                        cacheService.saveWithTtl(cacheKey, token, hours, TimeUnit.HOURS);
                    }
                }
            });

            return dbTokenOpt;

        } catch (IllegalArgumentException e) {
            log.warn("Public ID inválido: {}", userPublicId);
            return Optional.empty();
        } catch (DataAccessException e) {
            log.error("Erro SQL ao buscar token: {}", userPublicId, e);
            throw new DatabaseOperationException("Falha ao buscar o token.", e);
        }
    }

    /**
     * Deleta o token (Deleta a linha da tabela).
     */
    @Transactional
    public void deleteToken(String userPublicId) {
        try {
            UUID uuid = UUID.fromString(userPublicId);
            User user = userRepository.findByPublicId(uuid)
                    .orElseThrow(() -> new NotFoundException("Usuário não encontrado: " + userPublicId));

            // [CORREÇÃO] Deleta a linha da tabela de tokens, em vez de setar null no User
            tokenRepository.deleteByUser(user);

            log.info("Token deletado do SQL para: {}", userPublicId);

        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("ID inválido.");
        } catch (DataAccessException e) {
            log.error("Erro ao deletar token SQL: {}", userPublicId, e);
            throw new DatabaseOperationException("Falha ao deletar o token.", e);
        }

        // Remove do Cache
        cacheService.delete(CACHE_PREFIX + userPublicId);
    }
}