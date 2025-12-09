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
import br.edu.fatecpg.usafa.features.roles.repositories.IRoleRepository;
import br.edu.fatecpg.usafa.models.PasswordCreationToken;
import br.edu.fatecpg.usafa.models.Role;
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
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
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
    private final IRoleRepository roleRepository;

    @Value("${app.frontend.create-password-url}")
    private String createPasswordBaseUrl;

    private static final String CACHE_PREFIX = "auth:password-token:";
    private static final long TOKEN_EXPIRATION_HOURS = 24;

    @Transactional
    public Optional<PasswordCreationToken> createAndSaveToken(User user) {
        // 1. Validação defensiva
        if (user == null || user.getPublicId() == null) {
            log.error("Tentativa de criar token para usuário nulo/sem publicId.");
            throw new BusinessRuleException("Usuário inválido para criação de token.");
        }

        final String userPublicId = user.getPublicId().toString();

        // 2. Tenta reaproveitar token válido e ativo
        Optional<PasswordCreationToken> existingTokenOpt = tokenRepository.findByUserAndExpiryDateAfter(user,
                LocalDateTime.now());

        if (existingTokenOpt.isPresent()) {
            PasswordCreationToken existingToken = existingTokenOpt.get();

            // Só reutiliza se estiver ATIVO. Se estiver inativo, deixamos o fluxo seguir
            // para criar um novo.
            if (existingToken.isActive()) {
                log.info("Token válido e ativo encontrado. Reutilizando para usuário: {}", userPublicId);
                existingToken.setFullUrl(createPasswordBaseUrl + existingToken.getToken());

                // Atualiza cache
                patientPasswordHelper.updateCache(existingToken, userPublicId);
                return Optional.of(existingToken);
            }
            // Se chegou aqui, existe um token válido por data, mas INATIVO (já usado).
            // Não fazemos nada, o fluxo segue abaixo para deletar e criar um novo.
        }

        // 3. Criação de Novo Token (Lógica limpa)
        log.info("Gerando novo token para: {}", userPublicId);

        // Remove qualquer token anterior (vencido, inativo ou lixo) para garantir
        // unicidade 1-pra-1
        tokenRepository.deleteByUser(user);
        tokenRepository.flush(); // Força o delete antes do insert para evitar conflito de Unique Key

        String newTokenString = UUID.randomUUID().toString();
        String fullUrl = createPasswordBaseUrl + newTokenString;
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        try {
            PasswordCreationToken newToken = new PasswordCreationToken(newTokenString, fullUrl);
            newToken.setUser(user);
            newToken.setExpiryDate(expiryDate);
            newToken.setActive(true);

            PasswordCreationToken savedToken = tokenRepository.save(newToken);

            // Atualiza cache
            patientPasswordHelper.updateCache(savedToken, userPublicId);

            return Optional.of(savedToken);

        } catch (DataAccessException e) {
            log.error("Erro ao salvar token SQL para usuário {}: {}", userPublicId, e.getMessage());
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

        if (token.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new BusinessRuleException("Link expirado.");
        if (!token.isActive())
            throw new BusinessRuleException("Link já utilizado.");

        user.setPassword(passwordEncoder.encode(createPasswordDto.newPassword()));
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new BusinessRuleException("Erro interno: Role padrão não configurada."));
        user.setRoles(new HashSet<>(Set.of(defaultRole)));;

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

    // Método validateTokenAndGetUser não usa cache de PublicID, busca por Token
    // String direto no banco,
    // então mantivemos inalterado, pois o cache é por PublicID.
    public UserResponseDTO validateTokenAndGetUser(String tokenId) {
        PasswordCreationToken token = tokenRepository.findByTokenWithUser(tokenId)
                .orElseThrow(() -> new BusinessRuleException("Link inválido ou expirado."));

        if (token.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new BusinessRuleException("Link expirado.");

        User user = token.getUser();
        String tokenJwt = jwtUtils.generateToken(user);
        return userUtils.buildResponseDTO(user, tokenJwt);
    }
}