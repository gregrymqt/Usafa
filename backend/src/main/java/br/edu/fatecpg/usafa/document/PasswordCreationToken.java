package br.edu.fatecpg.usafa.document;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "password_creation_tokens")
public class PasswordCreationToken {

    @Id
    private String id;

    /**
     * O ID público do usuário (da tabela 'users' no PostgreSQL) ao qual este token pertence.
     * Indexado para buscas rápidas. Um usuário só pode ter um token ativo por vez.
     */
    @Indexed(unique = true)
    private String userPublicId;

    /**
     * A URL completa que será enviada ao usuário por e-mail.
     * Ex: https://seusite.com/create-password?id=...
     */
    private String url;

    /**
     * Data e hora em que o token/link irá expirar.
     * As anotações @Json... garantem que o Redis consiga salvar e ler essa data corretamente.
     */
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime expiryDate;

    public PasswordCreationToken(String userPublicId, String url) {
        this.userPublicId = userPublicId;
        this.url = url;
    }
}