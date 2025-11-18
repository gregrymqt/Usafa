package br.edu.fatecpg.usafa.shared.webSockets.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationMessage<T> {
    
    private String type;      // Ex: "CONSULTA_CONFIRMADA", "STATUS_ATUALIZADO"
    private String message;   // Mensagem humana. Ex: "Sua consulta foi agendada!"
    private T data;           // O objeto real (ConsultaSummaryDTO, etc.)
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
