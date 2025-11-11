// br/edu/fatecpg/usafa/features/auth/utilis/JwtUtils.java (Caminho assumido)

package br.edu.fatecpg.usafa.shared.tokens; // (Ajuste o package se necessário)

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

import java.util.Date;
import java.util.List;
import java.util.UUID; // 1. Importar UUID
import java.util.concurrent.TimeUnit; // 2. Importar TimeUnit
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * Gera um novo token JWT para um usuário.
     * MODIFICADO: Agora inclui um JTI (JWT ID)
     */

    @Async
    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        String jti = UUID.randomUUID().toString();

        // 1. Pega as roles (autoridades) do UserDetails
        List<String> roles = userDetails.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userDetails.getUsername()) // Email
                .id(jti)
                .claim("roles", roles) // <-- MÁGICA AQUI: Adiciona as roles ao token
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    /**
     * Extrai o username (email) de um token JWT.
     */
    @Async
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    // --- 5. NOVOS MÉTODOS PARA O LOGOUT ---

    /**
     * Extrai o JTI (JWT ID) de um token.
     */
    public String extractJti(String token) {
        try {
            return getClaimFromToken(token, Claims::getId);
        } catch (Exception e) {
            logger.warn("Não foi possível extrair JTI do token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrai a data de expiração de um token.
     */
    public Date extractExpiration(String token) {
        try {
            return getClaimFromToken(token, Claims::getExpiration);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Calcula o tempo restante de validade do token (em segundos).
     */
    public long getRemainingValiditySeconds(String token) {
        Date expiration = extractExpiration(token);
        if (expiration == null) {
            return 0;
        }
        long remainingMillis = expiration.getTime() - System.currentTimeMillis();
        if (remainingMillis < 0) {
            return 0;
        }
        return TimeUnit.MILLISECONDS.toSeconds(remainingMillis);
    }

    // --- MÉTODOS PRIVADOS (Seu código original) ---

    @Async
    public boolean validateToken(String token) {
        try {
            getParser().parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT inválido: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT não suportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Payload do token JWT está vazio: {}", e.getMessage());
        } catch (io.jsonwebtoken.security.SecurityException e) {
            logger.error("Assinatura do JWT inválida: {}", e.getMessage());
        }

        return false;
    }

    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getParser().parseSignedClaims(token).getPayload();
        return claimsResolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(this.jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private JwtParser getParser() {
        return Jwts.parser().verifyWith(getSigningKey()).build();
    }
}