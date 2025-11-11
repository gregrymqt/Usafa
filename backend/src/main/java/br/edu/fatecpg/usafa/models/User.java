package br.edu.fatecpg.usafa.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
@Entity
@Table(name = "users") // ou o nome da sua tabela
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    // Atributo para identificação pública, usando UUID para garantir unicidade
    private UUID publicId;

    private String name;

    private String email;

    private String password;

    private String googleId;

    private String picture;

    private String cpf;

    private String cep;

    private boolean isPacient;

    // Em: br/edu/fatecpg/usafa/features/auth/models/User.java
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", // Nome da tabela de junção
            joinColumns = @JoinColumn(name = "user_id"), // Coluna que referencia o User
            inverseJoinColumns = @JoinColumn(name = "role_id") // Coluna que referencia a Role
    )
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Consulta> consultas ;

    // Não se esqueça de adicionar getters e setters para 'roles'

    public User(String name, String email, String password, String googleId, String picture, String cpf, String cep) {
        this.publicId = UUID.randomUUID(); // Inicializa o publicId ao criar um novo usuário
        this.name = name;
        this.email = email;
        this.password = password;
        this.googleId = googleId;
        this.picture = picture;
        this.cpf = cpf;
        this.cep = cep;
    }

    public User() {
        this.publicId = UUID.randomUUID(); // Inicializa o publicId também no construtor padrão
    }

    // --- GETTERS
    public Long getId() {
        return id;
    }

    public UUID getPublicId() {
        return publicId;
    }

    public String getName() {
        return name;
    }

    public String getGoogleId() {
        return googleId;
    }

    public String getPicture() {
        return picture;
    }

    public String getCpf() {
        return cpf;
    }

    public String getCep() {
        return cep;
    }

    // Setters
    public void setPublicId(UUID publicId) {
        this.publicId = publicId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public boolean isPacient() {
        return isPacient;
    }

    public void setPacient(boolean isPacient) {
        this.isPacient = isPacient;
    }

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
