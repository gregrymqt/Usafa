package br.edu.fatecpg.usafa.features.admin.dtos.patient;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PasswordCreationTokenResponseDto {

    /**
     * A URL completa para a criação da senha.
     */
    private String url;

    /**
     * Data e hora em que o token/link irá expirar.
     */
    private LocalDateTime expiryDate;

}