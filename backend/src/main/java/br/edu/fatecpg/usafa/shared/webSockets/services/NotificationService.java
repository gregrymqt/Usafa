package br.edu.fatecpg.usafa.shared.webSockets.services;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.shared.webSockets.dtos.NotificationMessage;
import br.edu.fatecpg.usafa.shared.webSockets.interfaces.INotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService implements INotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // Destino padrão (O front escuta /user/queue/notifications)
    // Você pode sobrescrever isso nos métodos se precisar de filas específicas
    private static final String DEFAULT_DESTINATION = "/queue/notifications";

    /**
     * Envia uma notificação genérica para um usuário específico.
     * * @param userPublicId ID do usuário (UUID string)
     * @param type Tipo da notificação (para o front decidir qual componente abrir)
     * @param payload O objeto de dados (qualquer DTO)
     */
    public <T> void send(String userPublicId, String type, T payload) {
        send(userPublicId, type, null, payload, DEFAULT_DESTINATION);
    }

    /**
     * Sobrecarga para enviar com mensagem personalizada.
     */
    public <T> void send(String userPublicId, String type, String message, T payload) {
        send(userPublicId, type, message, payload, DEFAULT_DESTINATION);
    }

    /**
     * Método "Core" totalmente flexível.
     */
    public <T> void send(String userPublicId, String type, String message, T payload, String destination) {
        if (userPublicId == null || userPublicId.isBlank()) {
            log.warn("Tentativa de notificação ignorada: ID do usuário nulo.");
            return;
        }

        // Monta o envelope
        NotificationMessage<T> notification = NotificationMessage.<T>builder()
                .type(type)
                .message(message)
                .data(payload)
                .build();

        log.debug("Enviando notificação [{}] para usuário: {}", type, userPublicId);

        // Envia via WebSocket
        // O Spring converte para: /user/{userPublicId}/{destination}
        messagingTemplate.convertAndSendToUser(
                userPublicId,
                destination,
                notification
        );
    }
}
