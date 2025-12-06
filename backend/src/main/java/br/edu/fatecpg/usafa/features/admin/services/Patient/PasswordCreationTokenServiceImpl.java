package br.edu.fatecpg.usafa.features.admin.services.Patient;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.Password.CreatePasswordDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.Password.PasswordTokenCacheDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPasswordCreationTokenService;
import br.edu.fatecpg.usafa.features.admin.repositories.IPasswordCreationTokenRepository;
import br.edu.fatecpg.usafa.features.admin.utils.patient.PatientPasswordHelper;
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
    private final PatientPasswordHelper patientPasswordHelper;

    @Value("${app.frontend.create-password-url}")
    private String createPasswordBaseUrl;

    private static final String CACHE_PREFIX = "auth:password-token:";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    @Transactional
    public Optional<PasswordCreationToken> createAndSaveToken(User user) {
        if (user == null || user.getPublicId() == null) {
            log.error("Tentativa de criar token para usuário nulo/sem publicId.");
            throw new BusinessRuleException("Usuário inválido para criação de token.");
        }

        final String userPublicId = user.getPublicId().toString();

        Optional<PasswordCreationToken> existingTokenOpt = tokenRepository.findByUserAndExpiryDateAfter(user, LocalDateTime.now());
        if (existingTokenOpt.isPresent()) {
            log.info("Token válido existente encontrado. Reutilizando.");
            PasswordCreationToken existingToken = existingTokenOpt.get();
            existingToken.setFullUrl(createPasswordBaseUrl + existingToken.getToken());
            
            // Atualiza o cache com o token existente
            patientPasswordHelper.updateCache(existingToken, userPublicId);
            
            return Optional.of(existingToken);
        }

        log.info("Gerando novo token para: {}", userPublicId);
        String newTokenString = UUID.randomUUID().toString();
        String fullUrl = createPasswordBaseUrl + newTokenString;
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        try {
            if (tokenRepository.existsByUser(user)) {
                tokenRepository.deleteByUser(user);
                tokenRepository.flush();
            }

            PasswordCreationToken newToken = new PasswordCreationToken(newTokenString, fullUrl);
            newToken.setUser(user);
            newToken.setExpiryDate(expiryDate);

            PasswordCreationToken savedToken = tokenRepository.save(newToken);

            // Chama o método centralizado de cache
            patientPasswordHelper.updateCache(savedToken, userPublicId);

            return Optional.of(savedToken);

        } catch (DataAccessException e) {
            log.error("Erro ao salvar token SQL: {}", userPublicId, e);
            throw new DatabaseOperationException("Falha ao salvar o token de senha.", e);
        }
    }

    public Optional<PasswordCreationToken> findTokenByUserPublicId(String userPublicId) {
        String cacheKey = CACHE_PREFIX + userPublicId;

        // 1. Tenta Cache
        PasswordTokenCacheDto cachedDto = cacheService.get(cacheKey, PasswordTokenCacheDto.class);
        if (cachedDto != null) {
            log.info("Cache Hit para: {}", userPublicId);
            return Optional.of(patientPasswordHelper.toEntity(cachedDto));
        }

        // 2. Tenta Banco SQL
        log.info("Cache Miss. Buscando token no SQL para: {}", userPublicId);
        try {
            // Removemos espaços em branco para evitar erro de UUID
            UUID publicIdUuid = UUID.fromString(userPublicId.trim());

            // Buscamos o USER primeiro
            User user = userRepository.findByPublicId(publicIdUuid)
                    .orElseThrow(() -> new NotFoundException("Usuário não encontrado: " + userPublicId));

            // Buscamos o TOKEN pelo ID numérico do user
            Optional<PasswordCreationToken> dbTokenOpt = tokenRepository.findByUser_Id(user.getId()); // [cite: 22]

            dbTokenOpt.ifPresent(token -> {
                token.setFullUrl(createPasswordBaseUrl + token.getToken());
                
                // --- CORREÇÃO DO ERRO DE PROXY ---
                // O token vindo do banco tem o user como "Lazy Proxy".
                // Como já temos o objeto 'user' real carregado acima (linha 21),
                // setamos ele no token. Assim o Helper não tenta buscar no banco fechado.
                token.setUser(user); 
                
                patientPasswordHelper.updateCache(token, userPublicId);
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

    @Transactional
    public void createPassword(CreatePasswordDTO createPasswordDto) {
        User user = userUtils.getUserByPublicId(createPasswordDto.publicId())
            .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        PasswordCreationToken token = tokenRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new BusinessRuleException("Link inválido ou expirado."));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) throw new BusinessRuleException("Link expirado.");
        if (!token.isActive()) throw new BusinessRuleException("Link já utilizado.");

        user.setPassword(passwordEncoder.encode(createPasswordDto.newPassword()));
        userRepository.save(user);

        token.setActive(false);
        tokenRepository.save(token);
        
        // Limpa o cache pois o token foi invalidado
        // Usamos deletePattern como pedido, ou delete direto
        deleteToken(user.getPublicId().toString()); 
        
        log.info("Senha criada com sucesso para user ID: {}", user.getId());
    }

    @Transactional
    public void deleteToken(String userPublicId) {
        try {
            UUID uuid = UUID.fromString(userPublicId.trim());
            User user = userRepository.findByPublicId(uuid)
                    .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

            tokenRepository.deleteByUser(user);
            log.info("Token deletado do SQL para: {}", userPublicId);

        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("ID inválido.");
        } catch (DataAccessException e) {
            log.error("Erro ao deletar token SQL: {}", userPublicId, e);
            throw new DatabaseOperationException("Falha ao deletar o token.", e);
        }

        // Remove do Cache usando deletePattern como solicitado
        // O padrão busca a chave exata ou variações
        String pattern = CACHE_PREFIX + userPublicId + "*";
        cacheService.deletePattern(pattern);
    }
    
    // Método validateTokenAndGetUser não usa cache de PublicID, busca por Token String direto no banco,
    // então mantivemos inalterado, pois o cache é por PublicID.
    public UserResponseDTO validateTokenAndGetUser(String tokenId) {
        PasswordCreationToken token = tokenRepository.findByTokenWithUser(tokenId)
                .orElseThrow(() -> new BusinessRuleException("Link inválido ou expirado."));
        
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) throw new BusinessRuleException("Link expirado.");

        User user = token.getUser();
        String tokenJwt = jwtUtils.generateToken(user);
        return userUtils.buildResponseDTO(user, tokenJwt);
    }
}