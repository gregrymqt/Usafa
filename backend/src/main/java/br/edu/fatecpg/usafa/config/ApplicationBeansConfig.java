package br.edu.fatecpg.usafa.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.edu.fatecpg.usafa.shared.tokens.JwtAuthFilter;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;

/**
 * RESPONSABILIDADE: Definir os Beans (componentes) de infraestrutura da
 * aplicação.
 * Expõe o AuthenticationManager, o PasswordEncoder e o nosso JwtAuthFilter
 * para que o Spring possa injetá-los em outras classes.
 */
@Configuration
public class ApplicationBeansConfig {

    /**
     * Expõe o "Gerenciador de Autenticação" do Spring como um Bean.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Define o "Criptografador de Senhas".
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cria o nosso filtro de autenticação JWT como um Bean gerenciado pelo Spring.
     * O Spring irá injetar as dependências (JwtUtils, UserDetailsService)
     * automaticamente.
     */
    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        return new JwtAuthFilter(jwtUtils, userDetailsService,null);
    }
}
