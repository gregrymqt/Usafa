// br/edu/fatecpg/usafa/features/auth/JwtAuthFilter.java (Caminho assumido)

package br.edu.fatecpg.usafa.shared.tokens; // (Ajuste o package se necessário)

import br.edu.fatecpg.usafa.features.caching.ICacheService; // 1. Importar
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;
    private final ICacheService cacheService; // 2. Injetar ICacheService

    public JwtAuthFilter(JwtUtils jwtUtils, 
                         UserDetailsService userDetailsService,
                         ICacheService cacheService) { // 3. Adicionar no construtor
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
        this.cacheService = cacheService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtUtils.getUsernameFromToken(jwt);

            // 4. VERIFICAÇÃO DA BLOCKLIST (NOVA)
            final String jti = jwtUtils.extractJti(jwt);
            if (jti != null && cacheService.exists("blocklist:" + jti)) {
                // Se o JTI está no Redis, é um token deslogado. Rejeite.
                logger.warn("Tentativa de uso de token invalidado (blocklist): {}", jti);
                filterChain.doFilter(request, response);
                return; // Rejeita e para o filtro
            }

            // 5. Continua o fluxo normal (seu código original)
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Validação extra (opcional, mas boa prática)
                if (jwtUtils.validateToken(jwt)) { // Usando seu método de validação
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.debug("Não foi possível autenticar o usuário com o token JWT: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}