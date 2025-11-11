package br.edu.fatecpg.usafa.models;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, unique = true)
    private String name; // Ex: "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"

    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();

    // Construtores
    public Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
