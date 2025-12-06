package br.edu.fatecpg.usafa.features.auth.controllers;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.features.auth.dtos.*;
import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // Injeção da interface, não da classe concreta
    private final IUserAppService userAppService;
    private final JwtUtils jwtUtils; // 5. Injetar JwtUtils
    private final ICacheService cacheService; // 6. Injetar ICacheService


    @Autowired
    public AuthController(IUserAppService userAppService,
            JwtUtils jwtUtils,
            ICacheService cacheService) {
        this.userAppService = userAppService;
        this.jwtUtils = jwtUtils;
        this.cacheService = cacheService;
    }

    /**
     * Endpoint para autenticar um usuário com email e senha.
     * 
     * @param data O DTO contendo as credenciais de login.
     * @return Um ResponseEntity com o token JWT em caso de sucesso.
     */
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> loginUser(@RequestBody LoginRequestDTO data) {
        // A lógica foi movida para o serviço. O controller apenas delega.
        UserResponseDTO response = userAppService.processManualLogin(data);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para registrar um novo usuário.
     * 
     * @param data O DTO contendo os dados de registro.
     * @return Um ResponseEntity com uma mensagem de sucesso.
     */
    @PostMapping("/create")
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody RegisterRequestDTO data) {
        // O serviço agora retorna o DTO com o token para login automático.
        UserResponseDTO response = userAppService.processManualRegistration(data);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para registrar um novo usuário.
     * 
     * @param data O DTO contendo os dados de registro.
     * @return Um ResponseEntity com uma mensagem de sucesso.
     */
    @PutMapping("id/{id}")
    public ResponseEntity<UserResponseDTO> updateUserByPublicId(@PathVariable String id, @RequestBody UpdateUserByPublicIdDTO data) {
        // O serviço agora retorna o DTO com o token para login automático.
        Optional<UserResponseDTO> response = userAppService.updateUserByPublicId(id, data);
        return ResponseEntity.ok(response.get());
    }

    /**
     * Endpoint para realizar logout.
     * O endpoint salva o JTI do token na blocklist do Redis com o tempo restante de
     * validade do token.
     * Se o token for inválido (expirado, etc), apenas retorne OK.
     * 
     * @param request O request HTTP.
     * @return Um ResponseEntity com uma resposta vazia em caso de sucesso.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok().build();
            }

            String token = authHeader.substring(7); // Remove "Bearer "

            String jti = jwtUtils.extractJti(token); // Pega o ID
            long remainingSeconds = jwtUtils.getRemainingValiditySeconds(token); // Pega tempo

            if (jti != null && remainingSeconds > 0) {
                // Salva o JTI na blocklist do Redis com o tempo restante
                // Usando o seu método `saveWithTtl`
                cacheService.saveWithTtl("blocklist:" + jti, "blocked", remainingSeconds, TimeUnit.SECONDS);
            }

            return ResponseEntity.noContent().build(); 

    } catch (Exception e) {
        // MUDANÇA AQUI TAMBÉM
        return ResponseEntity.noContent().build();
    }
    }
}
