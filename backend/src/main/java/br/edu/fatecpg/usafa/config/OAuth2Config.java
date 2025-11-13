package br.edu.fatecpg.usafa.config;

import br.edu.fatecpg.usafa.features.auth.dtos.LoginGoogleRequestDTO;
import br.edu.fatecpg.usafa.features.auth.dtos.ResponseGoogleDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriComponentsBuilder;

import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;

/**
 * RESPONSABILIDADE: Configurar a lógica do OAuth2 (Login com Google).
 * Define o que acontece quando o login com Google é bem-sucedido.
 */
@Configuration
public class OAuth2Config {

    private final IUserAppService userService;
    private final String oauth2RedirectUrl;

    public OAuth2Config(IUserAppService userService,
            @Value("${app.oauth2.redirect-url}") String oauth2RedirectUrl) {
         this.userService = userService;
         this.oauth2RedirectUrl = oauth2RedirectUrl;
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2SuccessHandler() {
        return (request, response, authentication) -> {

            // 1. Pega os dados do usuário
            DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
            String email = oauthUser.getAttribute("email");
            String name = oauthUser.getAttribute("name");
            String picture = oauthUser.getAttribute("picture");
            String googleID = oauthUser.getAttribute("sub");

            // 2. Processa o login
            LoginGoogleRequestDTO userGoogleDTO = new LoginGoogleRequestDTO(name, email, googleID, picture);
            ResponseGoogleDTO loginResponse = userService.processGoogleLogin(userGoogleDTO); // (Agora contém 'needsCompletion')

            // 3. Constrói a URL de redirecionamento (MODIFICADA)
            String redirectUrl = UriComponentsBuilder.fromUriString(oauth2RedirectUrl)
                    .queryParam("token", loginResponse.token())
                    .queryParam("publicId", loginResponse.publicId())
                    .queryParam("isGoogleLogin", true)
                    .queryParam("isNewUser", loginResponse.isNewUser())
                    .queryParam("needsCompletion", loginResponse.needsCompletion())
                    .toUriString();

            // 4. Redireciona o usuário de volta para o App React
            response.sendRedirect(redirectUrl);
        };
    }
}