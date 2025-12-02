package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "medicos", indexes = {
    // Índices para colunas que serão muito usadas em 'WHERE'
    @Index(name = "idx_medico_public_id", columnList = "publicId", unique = true),
    @Index(name = "idx_medico_email", columnList = "email", unique = true),
    @Index(name = "idx_medico_crm", columnList = "crm", unique = true),
    @Index(name = "idx_medico_tipo_consulta_id", columnList = "tipo_consulta_id")
})
public class Medico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private String publicId;

    private String nome;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "picture_id", referencedColumnName = "id")
    private Picture picture;

    @Column(unique = true, nullable = false)
    private String email; // 

    @Column(unique = true, nullable = false)
    private String crm; // 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_consulta_id", nullable = false)
    private TipoConsulta tipoConsulta; // [cite: 17]
    
    // Relacionamento com Consulta (pode ser mantido para histórico)
    @OneToMany(mappedBy = "medico")
    private Set<Consulta> consultas; // [cite: 18]

    // Um médico tem muitos slots de horário
    @OneToMany(mappedBy = "medico", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HorarioSlot> horarios;

    @Column(nullable = false)
private boolean active = true; // Novo campo

    @PrePersist
    public void generatePublicId() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString();
        }
    }
}