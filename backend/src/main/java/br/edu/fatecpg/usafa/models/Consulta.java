package br.edu.fatecpg.usafa.models;

import br.edu.fatecpg.usafa.features.consulta.enums.ConsultaStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "consultas", indexes = {
    // Índice para o ID público que o front-end vai usar
    @Index(name = "idx_consulta_public_id", columnList = "publicId", unique = true),
    // Índices para as chaves estrangeiras (melhora performance de JOINs)
    @Index(name = "idx_consulta_user_id", columnList = "user_id"),
    @Index(name = "idx_consulta_medico_id", columnList = "medico_id"),
    @Index(name = "idx_consulta_slot_id", columnList = "horario_slot_id", unique = true),
    @Index(name = "idx_consulta_tipo_consulta_id", columnList = "tipo_consulta_id")
})
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // [cite: 2]

    @Column(unique = true, nullable = false, updatable = false)
    private String publicId; // [cite: 3]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // [cite: 4]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico; // [cite: 5]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_consulta_id", nullable = false)
    private TipoConsulta tipoConsulta; // [cite: 6]

    // --- NOVO RELACIONAMENTO ---
    // A Consulta agora "trava" um Slot de Horário
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_slot_id", unique = true, nullable = false)
    private HorarioSlot horarioSlot;

    @Lob 
    private String sintomas; // [cite: 8]

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultaStatus status; // [cite: 9]

    @PrePersist
    protected void onCreate() {
        if (this.publicId == null) {
            this.publicId = UUID.randomUUID().toString(); // [cite: 11]
        }
    }
}