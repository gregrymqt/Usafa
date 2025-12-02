package br.edu.fatecpg.usafa.features.admin.services.Patient;

import br.edu.fatecpg.usafa.document.PasswordCreationToken;

import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.repositories.IPasswordCreationTokenRepository;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.models.User;
import br.edu.fatecpg.usafa.shared.exceptions.BusinessRuleException;
import br.edu.fatecpg.usafa.shared.exceptions.MongoConnectionException;
import br.edu.fatecpg.usafa.shared.exceptions.DatabaseOperationException;
import br.edu.fatecpg.usafa.shared.exceptions.NotFoundException;
import com.mongodb.MongoException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordCreationTokenServiceImpl implements IPasswordCreationTokenService { // Supondo que você tenha a
                                                                                         // interface, se não tiver,
                                                                                         // pode remover o implements

    private final IPasswordCreationTokenRepository tokenRepository;
    private final ICacheService cacheService; // Injeção do nosso serviço de cache

    @Value("${app.frontend.create-password-url}")
    private String createPasswordBaseUrl;

    // Prefixo para organizar no Redis
    private static final String CACHE_PREFIX = "auth:password-token:";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    /**
     * Cria e salva um novo token.
     * Estratégia: Limpa vestígios antigos -> Salva no Banco -> Salva no Cache com
     * TTL.
     */
    public Optional<PasswordCreationToken> createAndSaveToken(User user) {
        if (user == null || user.getPublicId() == null) {
            log.error("Tentativa de criar token para um usuário nulo ou sem publicId.");
            throw new BusinessRuleException("Usuário inválido para criação de token.");
        }

        final String userPublicId = user.getPublicId().toString();

        // 1. Verifica se já existe um token válido (não expirado)
        Optional<PasswordCreationToken> existingTokenOpt = findTokenByUserPublicId(userPublicId);
        if (existingTokenOpt.isPresent() && existingTokenOpt.get().getExpiryDate().isAfter(LocalDateTime.now())) {
            log.info("Token válido já existe para o usuário: {}. Reutilizando.", userPublicId);
            // Reconstruímos a URL da mesma forma que faríamos para um novo token.
            return existingTokenOpt;
        }

        // 2. Se não existe ou expirou, cria um novo. A limpeza de tokens antigos é
        // feita se necessário.
        log.info("Gerando novo token de criação de senha para: {}", userPublicId);

        // 2. Prepara o novo Token
        String fullUrl = createPasswordBaseUrl + userPublicId;
        Optional<PasswordCreationToken> newToken;
        newToken = Optional.of(new PasswordCreationToken(userPublicId, fullUrl));
        newToken.get().setExpiryDate(LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS));

        // 3. Persiste no MongoDB (Fonte da verdade)
        try {
            tokenRepository.save(newToken.get());
        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao salvar o token para o usuário: {}", userPublicId, e);
                throw new MongoConnectionException("Falha de comunicação com o banco de dados ao salvar o token.", e);
            } else {
                log.error("Erro ao salvar o token no MongoDB para o usuário: {}", userPublicId, e);
                throw new DatabaseOperationException("Falha ao salvar o token de criação de senha.", e);
            }
        }
        // 4. Persiste no Redis (Acesso rápido)
        String cacheKey = CACHE_PREFIX + userPublicId;
        cacheService.saveWithTtl(cacheKey, newToken, TOKEN_EXPIRATION_HOURS, TimeUnit.HOURS);

        log.info("Token salvo (Mongo + Redis) para o usuário: {}", userPublicId);

        return newToken;
    }

    /**
     * Busca o token.
     * Estratégia: Cache-Aside (Tenta Cache -> Se falhar, tenta Banco -> Popula
     * Cache).
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
        Optional<PasswordCreationToken> dbTokenOpt;
        try {
            dbTokenOpt = tokenRepository.findByUserPublicId(userPublicId);
        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao buscar o token para o usuário: {}", userPublicId, e);
                throw new MongoConnectionException("Falha de comunicação com o banco de dados ao buscar o token.", e);
            } else {
                log.error("Erro ao buscar o token no MongoDB para o usuário: {}", userPublicId, e);
                throw new DatabaseOperationException("Falha ao buscar o token no banco de dados.", e);
            }
        }

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
        try {
            PasswordCreationToken token = tokenRepository.findByUserPublicId(userPublicId)
                    .orElseThrow(() -> new NotFoundException("Token não encontrado para o usuário: " + userPublicId));

            tokenRepository.delete(token);
            log.info("Token deletado do MongoDB para usuário: {}", userPublicId);

        } catch (DataAccessException e) {
            if (e instanceof DataAccessResourceFailureException || e.getCause() instanceof MongoException) {
                log.error("Erro de conexão com o MongoDB ao deletar o token para o usuário: {}", userPublicId, e);
                throw new MongoConnectionException("Falha de comunicação com o banco de dados ao deletar o token.", e);
            } else {
                log.error("Erro ao deletar o token do MongoDB para o usuário: {}", userPublicId, e);
                throw new DatabaseOperationException("Falha ao deletar o token.", e);
            }
        }

        // 2. Remove do Cache (Sempre, para garantir)
        String cacheKey = CACHE_PREFIX + userPublicId;
        cacheService.delete(cacheKey);
    }
}