package br.edu.fatecpg.usafa.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando há uma falha de conexão com o banco de dados MongoDB.
 * Retorna o status HTTP 500 (Internal Server Error).
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class MongoConnectionException extends RuntimeException {

    public MongoConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}