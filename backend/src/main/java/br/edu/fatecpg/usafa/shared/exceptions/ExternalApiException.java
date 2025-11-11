package br.edu.fatecpg.usafa.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando um serviço externo (ex: Google Maps API)
 * falha ou retorna um erro.
 * * Mapeia para o status HTTP 502 (Bad Gateway), indicando que
 * o servidor recebeu uma resposta inválida de um serviço "upstream".
 */
@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class ExternalApiException extends RuntimeException {

    public ExternalApiException(String message) {
        super(message);
    }

    public ExternalApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
