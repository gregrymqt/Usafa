package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

import br.edu.fatecpg.usafa.models.enums.StatusHorario;

@Data
@NoArgsConstructor
@Entity
@Table(name = "horarios_slot", indexes = {
    // ESTE É O ÍNDICE MAIS IMPORTANTE!
    // Para buscar "slots disponíveis de um médico"
    @Index(name = "idx_slot_medico_status", columnList = "medico_id, status"),
    
    // Para buscar slots por data (ex: "próximos 7 dias")
    @Index(name = "idx_slot_data_inicio", columnList = "dataHoraInicio")
})
public class HorarioSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String publicId = UUID.randomUUID().toString();

    // Muitos slots pertencem a UM médico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @Column(nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(nullable = false)
    private LocalDateTime dataHoraFim;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusHorario status;

    // Um slot pode estar ligado a UMA consulta
    @OneToOne(mappedBy = "horarioSlot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Consulta consulta;

    // Construtor útil para criar novos slots
    public HorarioSlot(Medico medico, LocalDateTime dataHoraInicio, LocalDateTime dataHoraFim) {
        this.medico = medico;
        this.dataHoraInicio = dataHoraInicio;
        this.dataHoraFim = dataHoraFim;
        this.status = StatusHorario.DISPONIVEL; // Começa como disponível
    }
}