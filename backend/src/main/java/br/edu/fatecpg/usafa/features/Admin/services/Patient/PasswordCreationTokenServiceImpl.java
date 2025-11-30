package br.edu.fatecpg.usafa.features.admin.services.Patient;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.repositories.IPasswordCreationTokenRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordCreationTokenServiceImpl implements IPasswordCreationTokenService { // Supondo que você tenha a interface, se não tiver, pode remover o implements

    private final IPasswordCreationTokenRepository tokenRepository;
    private final ICacheService cacheService; // Injeção do nosso serviço de cache

    @Value("${app.frontend.create-password-url}")
    private String createPasswordBaseUrl;

    // Prefixo para organizar no Redis
    private static final String CACHE_PREFIX = "auth:password-token:";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    /**
     * Cria e salva um novo token. 
     * Estratégia: Limpa vestígios antigos -> Salva no Banco -> Salva no Cache com TTL.
     */
        public String createAndSaveToken(User user) {
        String userPublicId = user.getPublicId().toString();
        
        // 1. Limpeza preventiva: Remove qualquer token anterior (Cache + Banco)
        deleteToken(userPublicId);

        log.info("Gerando novo token de criação de senha para: {}", userPublicId);

        // 2. Prepara o novo Token
        String fullUrl = createPasswordBaseUrl + userPublicId;
        PasswordCreationToken newToken = new PasswordCreationToken(userPublicId, fullUrl);
        newToken.setExpiryDate(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));

        // 3. Persiste no MongoDB (Fonte da verdade)
        tokenRepository.save(newToken);

        // 4. Persiste no Redis (Acesso rápido) com o mesmo tempo de expiração
        String cacheKey = CACHE_PREFIX + userPublicId;
        cacheService.saveWithTtl(cacheKey, newToken, TOKEN_EXPIRATION_HOURS, TimeUnit.HOURS);

        log.info("Token salvo (Mongo + Redis) para o usuário: {}", userPublicId);

        return fullUrl;
    }

    /**
     * Busca o token.
     * Estratégia: Cache-Aside (Tenta Cache -> Se falhar, tenta Banco -> Popula Cache).
     */
    public Optional<PasswordCreationToken> findTokenByUserPublicId(String userPublicId) {
        String cacheKey = CACHE_PREFIX + userPublicId;

        // 1. Tenta Cache
        PasswordCreationToken cachedToken = cacheService.get(cacheKey, PasswordCreationToken.class);
        if (cachedToken != null) {
            log.debug("Token recuperado do cache para: {}", userPublicId);
            return Optional.of(cachedToken);
        }

        // 2. Tenta Banco
        log.info("Cache Miss. Buscando token no MongoDB para: {}", userPublicId);
        Optional<PasswordCreationToken> dbTokenOpt = tokenRepository.findByUserPublicId(userPublicId);

        // 3. Se achou no banco, popula o cache (se ainda estiver válido)
        dbTokenOpt.ifPresent(token -> {
            // Verifica se já não expirou antes de colocar no cache
            if (token.getExpiryDate().isAfter(LocalDateTime.now())) {
                // Calcula o tempo restante para não setar 24h de novo erroneamente
                long hoursRemaining = java.time.Duration.between(LocalDateTime.now(), token.getExpiryDate()).toHours();
                if (hoursRemaining > 0) {
                    cacheService.saveWithTtl(cacheKey, token, hoursRemaining, TimeUnit.HOURS);
                }
            }
        });

        return dbTokenOpt;
    }

    /**
     * Deleta o token.
     * Estratégia: Write-Through (Remove do Banco e Remove do Cache).
     */
    public void deleteToken(String userPublicId) {
        // 1. Remove do Banco
        tokenRepository.findByUserPublicId(userPublicId).ifPresent(token -> {
            tokenRepository.delete(token);
            log.info("Token deletado do MongoDB para usuário: {}", userPublicId);
        });

        // 2. Remove do Cache (Sempre, para garantir)
        String cacheKey = CACHE_PREFIX + userPublicId;
        cacheService.delete(cacheKey);
    }
}