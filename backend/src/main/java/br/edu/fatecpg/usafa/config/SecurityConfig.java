package br.edu.fatecpg.usafa.config;

import br.edu.fatecpg.usafa.shared.tokens.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
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
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final AuthenticationProvider authenticationProvider;
        private final AuthenticationSuccessHandler oAuth2SuccessHandler;
        private final JwtAuthFilter jwtAuthFilter; // Movi para cá para injeção via construtor

        @Value("${app.cors.allowed-origin}")
        private String allowedOrigin;

        @Value("${app.url.general}")
        private String urlGeneral;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/auth/**", // Cobre Login, Register e seu
                                                                            // LogoutController
                                                                "/oauth2/**", // Endpoints do OAuth2
                                                                "/login/**", // Páginas de login padrão
                                                                "/error", // Tratamento de erros
                                                                "/v3/api-docs/**", // Swagger
                                                                "/swagger-ui/**", // Swagger UI
                                                                "/api/v1/maps/**", // Sua API de mapas
                                                                "/home/**", // <--- CORREÇÃO: Libera toda a área da Home
                                                                "/admin/password-tokens/validate/**",
                                                                "/uploads/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2SuccessHandler))
                                // Desabilita o logout padrão do Spring para evitar conflito com seu Controller
                                // customizado
                                .logout(AbstractHttpConfigurer::disable)

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // 1. Defina explicitamente as origens permitidas.
                // O erro acontece frequentemente porque o navegador não aceita '*' quando
                // credentials=true
                // Adicione o localhost do Vite (5173) e a URL do Ngrok se necessário.
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:5173", // Seu Frontend Local
                                "http://localhost:3000", // Caso use porta 3000
                                urlGeneral // Sua URL Ngrok (Opcional, mas bom ter)
                ));

                // 2. Métodos permitidos
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

                // 3. Headers permitidos (Mantenha o ngrok-skip-browser-warning)
                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Auth-Token",
                                "ngrok-skip-browser-warning", // Importante para Ngrok
                                "Origin",
                                "Accept",
                                "X-Requested-With",
                                "Access-Control-Request-Method",
                                "Access-Control-Request-Headers"));

                // 4. Expor headers para o frontend ler
                configuration.setExposedHeaders(List.of("Authorization", "X-Auth-Token"));

                // 5. Permitir cookies/credenciais
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}