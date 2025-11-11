package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// @Data - Gera getters, setters, toString, equals e hashCode
// @NoArgsConstructor - Gera um construtor sem argumentos
// @AllArgsConstructor - Gera um construtor com todos os argumentos
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usafas") // Define o nome da tabela no banco de dados
public class Usafa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, length = 9) // Formato 00000-000
    private String cep;

    // --- Relacionamento com o Usuário ---
    // Esta é a forma ideal de "salvar o Id do usuário".
    // Isso cria uma coluna 'user_id' na tabela 'locations'
    // que é uma chave estrangeira para a tabela 'users'.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
