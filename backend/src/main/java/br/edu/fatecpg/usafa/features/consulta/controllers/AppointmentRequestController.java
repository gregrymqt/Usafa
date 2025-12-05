package br.edu.fatecpg.usafa.features.consulta.controllers; // Ajuste o pacote

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentRequestService;
import br.edu.fatecpg.usafa.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/requests")
@RequiredArgsConstructor
@Slf4j
public class AppointmentRequestController {

    private final IAppointmentRequestService requestService;
    private final UserUtils userUtils;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CONSULTA_QUEUE_NAME = "fila:consultas:request";

    /**
     * [USER] Cria uma nova solicitação (Envia para Fila Redis).
     * Usa AppointmentOperationDTO.
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> criarSolicitacao(
            @Validated @RequestBody AppointmentOperationDTO requestDTO,
            Authentication authentication) {
        
        User user = userUtils.getUserFromAuthentication(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // Garante que o ID do paciente é o do usuário logado
        requestDTO.setPatientId(user.getPublicId().toString());

        try {
            // Publica no Redis para processamento assíncrono
            // Importante: O DTO deve ser Serializável ou o RedisTemplate configurado com Jackson
            redisTemplate.convertAndSend(CONSULTA_QUEUE_NAME, requestDTO);
            log.info("Solicitação enviada para fila. Usuário: {}", user.getPublicId());
            return ResponseEntity.accepted().body("Solicitação recebida. Aguarde a confirmação.");
            
        } catch (Exception e) {
            log.error("Erro ao publicar no Redis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao processar solicitação.");
        }
    }

    /**
     * [USER & ADMIN] Lista solicitações.
     * Separa a lógica: Admin recebe DTO completo, User recebe DTO simplificado.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> listarSolicitacoes(
            @RequestParam(required = false) String userId, // Filtro opcional para Admin
            @RequestParam(required = false) String status,
            @PageableDefault(sort = "dia", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {

        User currentUser = userUtils.getUserFromAuthentication(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            // Admin vê tudo ou filtra, e recebe o DTO completo (AdminResponseDTO)
            // O filtro de userId pode ser passado se vier na requisição
            // Nota: Se userId vier nulo, o service deve tratar (ou removê-lo se o método admin não filtrar por user específico na sua regra atual)
            // Na interface atual: getAllRequestsAdmin(status, pageable) -> Filtra por status.
            return ResponseEntity.ok(requestService.getAllRequestsAdmin(status, pageable));
        } else {
            // User vê apenas as suas e recebe DTO simples (UserResponseDTO)
            return ResponseEntity.ok(requestService.getRequestsByUser(currentUser.getPublicId().toString(), pageable));
        }
    }

    /**
     * [ADMIN] Atualiza status (ACEITA/RECUSA) ou re-agenda solicitação.
     * Usa AppointmentOperationDTO.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentAdminResponseDTO> atualizarStatus(
            @PathVariable String id,
            @RequestBody AppointmentOperationDTO dto) {
        return ResponseEntity.ok(requestService.updateStatus(id, dto));
    }

    /**
     * [ADMIN] Exclui uma solicitação.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletarSolicitacao(@PathVariable String id) {
        requestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}