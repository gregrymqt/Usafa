package br.edu.fatecpg.usafa.models;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;

@Data
@NoArgsConstructor
@Entity
@Table(name = "consultas")
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID interno do banco

    @Column(unique = true, nullable = false, updatable = false)
    private String publicId; // ID público para o front-end

    // Relacionamentos (assumindo que estas entidades existem)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_consulta_id", nullable = false)
    private TipoConsulta tipoConsulta;

    @Column(nullable = false)
    private LocalDate dia; // Melhor que String para queries no banco

    @Column(nullable = false)
    private LocalTime horario; // Melhor que String

    @Lob // Para textos longos (pode ser @Column(length = 1000) também)
    private String sintomas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultaStatus status;

    /**
     * Gera automaticamente um publicId (UUID) antes de salvar
     * uma nova consulta no banco.
     */
    @PrePersist
    protected void onCreate() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString();
        }
    }
}
