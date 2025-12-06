package br.edu.fatecpg.usafa.features.admin.dtos.patient.Password;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

// Usando 'record' do Java (se for Java 14+) para ser mais limpo. 
// Se for Java antigo, crie uma classe normal com Getters/Setters e construtor vazio.
public record PasswordTokenCacheDto(
    long id,
    String token,
    String fullUrl,
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    LocalDateTime expiryDate,
    boolean active,
    Long userId,       // Guardamos apenas o ID do usuário
    UUID userPublicId  // Guardamos o PublicID para buscas futuras
) {}
