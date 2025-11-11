package br.edu.fatecpg.usafa.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção lançada quando ocorre um erro inesperado durante
 * uma operação com o banco de dados (que não seja uma exceção
 * de "Recurso Não Encontrado" ou "Violação de Integridade").
 * * Mapeia para o status HTTP 500 (Internal Server Error).
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class DatabaseOperationException extends RuntimeException {

    public DatabaseOperationException(String message) {
        super(message);
    }

    public DatabaseOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
