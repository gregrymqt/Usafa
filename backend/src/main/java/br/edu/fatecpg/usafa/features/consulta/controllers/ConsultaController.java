package br.edu.fatecpg.usafa.features.consulta.controllers;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // 2. Importa Authentication
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.config.queues.ConsultaQueueConfig;
import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaMessageDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;
import br.edu.fatecpg.usafa.models.User;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/consultas") // Mapeia a URL base (ex: /api/consultas)
@RequiredArgsConstructor
@Slf4j
public class ConsultaController {

    // Instancia a INTERFACE do serviço (não a implementação)
    private final IConsultaService consultaService;
    private final UserUtils userUtils;
    private final AmqpTemplate amqpTemplate;

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
     * Cria uma SOLICITAÇÃO de consulta de forma assíncrona.
     * A requisição é validada minimamente e enviada para a fila do RabbitMQ.
     */
    @PostMapping
    public ResponseEntity<String> criarConsulta(
            @Validated @RequestBody ConsultaRequestDTO requestDTO,
            Authentication authentication // [cite: 1]
    ) {
        // 1. Pega o usuário da autenticação [cite: 1, 3]
        Optional<User> userOptional = userUtils.getUserFromAuthentication(authentication);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // [cite: 2]
        }
        User user = userOptional.get();

        // 2. Cria o DTO da Mensagem (com o ID do usuário)
        ConsultaMessageDTO message = new ConsultaMessageDTO(
                requestDTO,
                user.getPublicId().toString()
        );

        // 3. Publica a mensagem na fila do RabbitMQ
        try {
            amqpTemplate.convertAndSend(
                    ConsultaQueueConfig.EXCHANGE_NAME,
                    ConsultaQueueConfig.CONSULTA_ROUTING_KEY,
                    message // O template converte isso para JSON
            );
            log.info("Solicitação de consulta enviada para a fila pelo usuário: {}", user.getPublicId());

            // 4. Retorna 202 Accepted (Aceito) IMEDIATAMENTE.
            // O front-end não recebe mais o ConsultaSummaryDTO 
            return ResponseEntity.accepted()
                                 .body("Sua solicitação foi recebida e está sendo processada.");

        } catch (Exception e) {
            log.error("Falha ao publicar mensagem no RabbitMQ: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Não foi possível processar sua solicitação no momento.");
        }
    }
}