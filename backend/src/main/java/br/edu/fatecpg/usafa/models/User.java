package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashSet;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Set;

/**
 * Esta é a sua entidade de Usuário.
 * A MÁGICA é que ela também implementa a interface UserDetails.
 * Isso permite que o Spring Security entenda seu modelo de dados.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_publicid", columnList = "publicId", unique = true),
        @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    // Atributo para identificação pública, usando UUID para garantir unicidade
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String googleId;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "picture_id", referencedColumnName = "id")
    private Picture picture;

    @Column(nullable = true, unique = true) // Deixe explícito que pode ser nulo
    private String cpf;

    @Column(nullable = true)
    private String cep;

    @Column(nullable = true, unique = true)
    private String phone;

    @Column(nullable = true)
    private LocalDate birthDate;

    @Column(nullable = false)
    private boolean createdByAdmin = false;

    // Em: br/edu/fatecpg/usafa/features/auth/models/User.java
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", // Nome da tabela de junção
            joinColumns = @JoinColumn(name = "user_id"), // Coluna que referencia o User
            inverseJoinColumns = @JoinColumn(name = "role_id") // Coluna que referencia a Role
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Consulta> consultas;

    // --- MÉTODOS OBRIGATÓRIOS DO UserDetails ---

    /**
     * Retorna as permissões/cargos (roles) do usuário.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Mapeia o nosso Set<Role> para a lista que o Spring Security entende.
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    /**
     * Retorna a SENHA.
     * O Spring Security vai pegar essa senha e comparar com a que o
     * usuário digitou (usando o PasswordEncoder).
     */
    @Override
    public String getPassword() {
        return this.password;
    }

    /**
     * Retorna o USERNAME (no nosso caso, o email).
     */
    @Override
    public String getUsername() {
        return this.email;
    }

    // --- Métodos de status da conta ---
    // Você pode implementar lógicas mais complexas aqui (ex: banimento)
    // Por enquanto, todos retornam 'true' (conta ativa).

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
