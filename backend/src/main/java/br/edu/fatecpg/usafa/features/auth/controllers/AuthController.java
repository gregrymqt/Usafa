package br.edu.fatecpg.usafa.features.auth.controllers;

import java.util.List;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.features.auth.dtos.*;
import br.edu.fatecpg.usafa.features.auth.interfaces.IUserAppService;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.caching.ICacheService;
import br.edu.fatecpg.usafa.features.roles.interfaces.IRoleService;
import br.edu.fatecpg.usafa.models.Role;
import br.edu.fatecpg.usafa.shared.tokens.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // Injeção da interface, não da classe concreta
    private final IUserAppService userAppService;
    private final UserUtils userUtils;
    private final JwtUtils jwtUtils; // 5. Injetar JwtUtils
    private final ICacheService cacheService; // 6. Injetar ICacheService
    private final IRoleService roleService; // 7. Injetar IRoleService


    @Autowired
    public AuthController(IUserAppService userAppService,
            UserUtils userUtils,
            IRoleService roleService,
            JwtUtils jwtUtils,
            ICacheService cacheService) {
        this.userAppService = userAppService;
        this.jwtUtils = jwtUtils;
        this.userUtils = userUtils;
        this.cacheService = cacheService;
        this.roleService = roleService;
    }

    /**
     * Endpoint para autenticar um usuário com email e senha.
     * 
     * @param data O DTO contendo as credenciais de login.
     * @return Um ResponseEntity com o token JWT em caso de sucesso.
     */
    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> loginUser(@RequestBody LoginRequestDTO data) {
        // A lógica foi movida para o serviço. O controller apenas delega.
        ResponseDTO response = userAppService.processManualLogin(data);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para registrar um novo usuário.
     * 
     * @param data O DTO contendo os dados de registro.
     * @return Um ResponseEntity com uma mensagem de sucesso.
     */
    @PostMapping("/create")
    public ResponseEntity<ResponseDTO> createUser(@RequestBody RegisterRequestDTO data) {
        // O serviço agora retorna o DTO com o token para login automático.
        ResponseDTO response = userAppService.processManualRegistration(data);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para registrar um novo usuário.
     * 
     * @param data O DTO contendo os dados de registro.
     * @return Um ResponseEntity com uma mensagem de sucesso.
     */
    @GetMapping("id/{id}")
    public ResponseEntity<ResponseDTO> getUserByPublicId(@PathVariable String id) {
        return userUtils.getUserByPublicId(id)
                .map(user -> {
                    List<String> roles = roleService.getUserRoles(user.getPublicId().toString()).stream()
                            .map(Role::getName)
                            .toList();

                    ResponseDTO response = new ResponseDTO(
                            null, // O token não é gerado neste endpoint
                            user.getPublicId().toString(),
                            user.getName(),
                            user.getEmail(),
                            user.getCep(),
                            user.getPhone(),
                            (user.getBirthDate() != null)
                                    ? user.getBirthDate().atStartOfDay().format(DateTimeFormatter.ISO_DATE_TIME) + "Z"
                                    : null,
                            roles);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint para registrar um novo usuário.
     * 
     * @param data O DTO contendo os dados de registro.
     * @return Um ResponseEntity com uma mensagem de sucesso.
     */
    @PutMapping("id/{id}")
    public ResponseEntity<ResponseDTO> updateUserByPublicId(@PathVariable String id, @RequestBody UpdateUserByPublicIdDTO data) {
        // O serviço agora retorna o DTO com o token para login automático.
        Optional<ResponseDTO> response = userAppService.updateUserByPublicId(id, data);
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

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            // Se o token já for inválido (expirado, etc), apenas retorne OK
            return ResponseEntity.ok().build();
        }
    }
}
