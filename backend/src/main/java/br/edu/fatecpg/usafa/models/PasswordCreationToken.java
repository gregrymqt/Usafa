package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@Entity
@Table(name = "password_creation_tokens")
public class PasswordCreationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true) // FK única para 1-pra-1
    @ToString.Exclude // Evita erro de StackOverflow nos logs
    private User user;

    @Transient // Não salva no banco, serve só pro Java
    private String fullUrl;

    @Column(nullable = false)
    private boolean active;

    public PasswordCreationToken(String token, String fullUrl) {
        this.token = token;
        this.fullUrl = fullUrl;
    }
    public PasswordCreationToken(Long id, String token, LocalDateTime expiryDate, User user, String fullUrl, boolean active) {
        this.id = id;
        this.token = token;
        this.expiryDate = expiryDate;
        this.user = user;
        this.fullUrl = fullUrl;
        this.active = active;
    }
}