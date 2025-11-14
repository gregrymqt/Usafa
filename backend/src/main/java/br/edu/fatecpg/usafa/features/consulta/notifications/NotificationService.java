package br.edu.fatecpg.usafa.features.consulta.notifications;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    // Template do Spring para enviar mensagens WebSocket
    private final SimpMessagingTemplate messagingTemplate;

    // O destino que o front-end irá escutar
    private static final String DESTINATION = "/queue/consultas";

    /**
     * Envia a confirmação da consulta para um usuário específico via WebSocket.
     *
     * @param userPublicId O ID público do usuário que receberá a notificação.
     * @param summary      O DTO com os dados da consulta (protocolo, médico, etc.)
     */
    public void sendConsultaConfirmation(String userPublicId, ConsultaSummaryDTO summary) {
        if (userPublicId == null || userPublicId.isBlank()) {
            log.warn("Tentativa de enviar notificação sem ID de usuário.");
            return;
        }

        log.info("Enviando confirmação da consulta (Protocolo: {}) para o usuário: {}",
                 summary.getProtocolo(), userPublicId);

        // O Spring transforma isso em "/user/{userPublicId}/queue/consultas"
        messagingTemplate.convertAndSendToUser(
                userPublicId,
                DESTINATION,
                summary // O DTO será serializado para JSON
        );
    }
}
