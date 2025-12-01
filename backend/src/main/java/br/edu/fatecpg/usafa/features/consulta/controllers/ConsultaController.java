package br.edu.fatecpg.usafa.features.consulta.controllers;

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

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.FormSelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaConsumerService;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/consultas")
@RequiredArgsConstructor
@Slf4j
public class ConsultaController {

    private final IConsultaService consultaService;
    private final UserUtils userUtils;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String CONSULTA_QUEUE_NAME = "fila:consultas:request";
    private final IConsultaConsumerService consultaConsumerService;
    /**
     * Endpoint para buscar o histórico de consultas.
     * Use hasAnyRole se Admin também puder ver.
     */
    @GetMapping("/user/{userId}")
    // CORREÇÃO: Aceita USER ou ADMIN. O permitAll() deixava aberto para não logados.
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')") 
    public ResponseEntity<List<ConsultaDTO>> getConsultasPorUsuario(
            @PathVariable String userId,
            Authentication authentication
    ) {
        Optional<User> userOptional = userUtils.getUserFromAuthentication(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userOptional.get();

        // Sua lógica de segurança manual (Excelente para garantir que USER X não veja dados de USER Y)
        // Dica: Se for ADMIN, talvez você queira pular essa verificação no futuro
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getPublicId().toString().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ConsultaDTO> consultas = consultaService.findConsultasByUser(user);
        return ResponseEntity.ok(consultas);
    }

    @GetMapping("/options")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConsultaFormOptionsDTO> getFormularioOptions() {
        ConsultaFormOptionsDTO options = consultaService.getFormOptions();
        return ResponseEntity.ok(options);
    }

    // Endpoint 2: Carga Dinâmica (Horários por Tipo)
    @GetMapping("/horarios-disponiveis/{tipoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FormSelectOptionDTO>> getHorariosPorTipo(@PathVariable String tipoId) {
        List<FormSelectOptionDTO> horarios = consultaService.getHorariosDisponiveisPorTipo(tipoId);
        return ResponseEntity.ok(horarios);
    }

    /**
     * Criar solicitação de consulta.
     */
    @PostMapping
    // CORREÇÃO: Apenas USER deve agendar para si mesmo (geralmente Admin tem outra rota ou usa essa com cuidado)
    @PreAuthorize("hasRole('USER')") 
    public ResponseEntity<String> criarConsulta(
            @Validated @RequestBody AppointmentRequestDto requestDTO, 
            Authentication authentication
    ) {
        User user = userUtils.getUserFromAuthentication(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        requestDTO.setPatientId(user.getPublicId().toString());

        try {
            redisTemplate.convertAndSend( 
                CONSULTA_QUEUE_NAME,
                requestDTO
            );

            log.info("Solicitação enviada para o Redis. Usuário: {}", user.getPublicId());

            return ResponseEntity.accepted()
                    .body("Sua solicitação foi recebida e está sendo processada.");

        } catch (Exception e) {
            log.error("Falha ao publicar no Redis: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno ao processar solicitação.");
        }
    }

    @GetMapping("/requests/user/{userId}") // URL Diferenciada
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<RequestAppointmentResponseDto>> getSolicitacoesPorUsuario(
            @PathVariable String userId,
            @RequestParam(required = false) String status, // Filtro opcional (?status=PENDENTE)
            @PageableDefault(sort = "dia", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication
    ) {
        // 1. Segurança: Verifica se o usuário existe
        User user = userUtils.getUserFromAuthentication(authentication)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // 2. Segurança: Garante que o usuário só veja os SEUS pedidos (a menos que seja Admin)
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getPublicId().toString().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 3. Busca no Mongo através da Service
        Page<RequestAppointmentResponseDto> requests = consultaConsumerService
                .findByUserPublicIdAndStatus(userId, status, pageable);

        return ResponseEntity.ok(requests);
    }
}