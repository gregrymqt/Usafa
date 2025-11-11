package br.edu.fatecpg.usafa.features.consulta.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // 2. Importa Authentication
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
// (Importe as classes do Spring Security para pegar o usuário autenticado)
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;

import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/consultas") // Mapeia a URL base (ex: /api/consultas)
@RequiredArgsConstructor
public class ConsultaController {

    // Instancia a INTERFACE do serviço (não a implementação)
    private final IConsultaService consultaService;
    private final UserUtils userUtils; // 3. Injeta o UserUtils

    /**
     * Endpoint para buscar o histórico de consultas de um usuário.
     * (Consome o 'getConsultas' do front-end)
     *
     * GET /consultas/user/{userId}
     */
    @SuppressWarnings("unlikely-arg-type")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConsultaDTO>> getConsultasPorUsuario(
            @PathVariable String userId,
            Authentication authentication // 4. Recebe o usuário autenticado
    ) {
        // 5. Usa o UserUtils para buscar o usuário
        Optional<User> userOptional = userUtils.getUserFromAuthentication(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();

        // 6. Implementa a lógica de segurança que estava comentada
        // Verifica se o 'userId' do path é o mesmo do usuário logado
        if (!user.getPublicId().equals(userId)) {
            // (Você pode adicionar uma checagem de Admin aqui, se necessário)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // 7. Remove o mock e usa o usuário real
        List<ConsultaDTO> consultas = consultaService.findConsultasByUser(user);
        return ResponseEntity.ok(consultas);
    }

    /**
     * Endpoint para buscar as opções dos <select> do formulário.
     * (Consome o 'getFormOptions' do front-end)
     *
     * GET /consultas/options
     */
    @GetMapping("/options")
    public ResponseEntity<ConsultaFormOptionsDTO> getFormularioOptions() {
        ConsultaFormOptionsDTO options = consultaService.getFormOptions();
        return ResponseEntity.ok(options);
    }

    /**
     * Endpoint para criar uma nova solicitação de consulta.
     * (Consome o 'requestConsulta' do front-end)
     *
     * POST /consultas
     */
    @PostMapping
    public ResponseEntity<ConsultaSummaryDTO> criarConsulta(
            @Validated @RequestBody ConsultaRequestDTO requestDTO,
            Authentication authentication // 8. Recebe o usuário autenticado
    ) {
        
        // 9. Usa o UserUtils para buscar o usuário
        Optional<User> userOptional = userUtils.getUserFromAuthentication(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();

        // 10. Remove o mock e usa o usuário real
        ConsultaSummaryDTO summary = consultaService.createConsulta(requestDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(summary);
    }
}