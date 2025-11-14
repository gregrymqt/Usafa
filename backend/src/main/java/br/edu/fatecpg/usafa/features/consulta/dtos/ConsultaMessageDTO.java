package br.edu.fatecpg.usafa.features.consulta.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO interno usado para enviar a mensagem para o RabbitMQ.
 * Ele combina a requisição original do front-end com o
 * ID do usuário que fez a solicitação.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaMessageDTO {

    // A requisição original vinda do front-end
    private ConsultaRequestDTO requestData;

    // O ID público do usuário que está autenticado
    private String userPublicId;
}
