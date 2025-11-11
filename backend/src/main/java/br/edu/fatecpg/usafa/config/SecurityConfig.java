package br.edu.fatecpg.usafa.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import br.edu.fatecpg.usafa.shared.tokens.JwtAuthFilter;

import java.util.Arrays;
import java.util.List;

/**
 * RESPONSABILIDADE: Configurar a cadeia de filtros de segurança do Spring.
 * Define quais rotas são públicas, quais são protegidas, desabilita CSRF,
 * configura CORS e adiciona nosso filtro JWT na ordem correta.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    @Autowired
    public SecurityConfig(JwtAuthFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // 1. Desabilita CSRF para APIs REST
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 2. Habilita e configura o CORS
                .authorizeHttpRequests(auth -> auth
                        // 3. Define endpoints públicos que não precisam de autenticação
                        .requestMatchers("/auth/**", "/error", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                        // 4. Todas as outras requisições precisam estar autenticadas
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        // 5. Garante que a API seja stateless, sem sessões no servidor
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                // 6. Adiciona nosso filtro JWT ANTES do filtro padrão de username/password
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 7. Permite requisições da URL do seu frontend
        configuration.setAllowedOrigins(List.of(allowedOrigin.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token"));
        configuration.setExposedHeaders(List.of("X-Auth-Token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}