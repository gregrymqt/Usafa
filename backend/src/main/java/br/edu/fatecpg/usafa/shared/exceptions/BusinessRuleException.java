package br.edu.fatecpg.usafa.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando uma regra de negócio é violada.
 * * Mapeia para o status HTTP 400 (Bad Request) ou 409 (Conflict).
 * Isso informa ao cliente que a requisição não pôde ser processada
 * como foi enviada.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST) // Ou HttpStatus.CONFLICT (409) se preferir
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }

    public BusinessRuleException(String message, Throwable cause) {
        super(message, cause);
    }
}
