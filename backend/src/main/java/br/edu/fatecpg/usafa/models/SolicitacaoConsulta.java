package br.edu.fatecpg.usafa.models;

import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaRequestDTO;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Representa uma solicitação de consulta no banco de dados relacional.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "solicitacoes_consulta")
public class SolicitacaoConsulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sintomas;

    @Column(nullable = false)
    private LocalDate dia;

    @Column(nullable = false)
    private LocalTime horario;

    @Column(nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medico_id", nullable = false)
    private Medico medico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_consulta_id", nullable = false)
    private TipoConsulta tipoConsulta;

    /**
     * Construtor auxiliar para criar a entidade a partir dos dados validados.
     */
    public SolicitacaoConsulta(ConsultaRequestDTO request, User user, Medico medico, TipoConsulta tipo) {
        this.sintomas = request.getSintomas();
        this.dia = LocalDate.parse(request.getDia());
        this.horario = LocalTime.parse(request.getHorario());
        this.status = "PENDENTE"; // Status inicial

        // Associações diretas com as outras entidades
        this.user = user;
        this.medico = medico;
        this.tipoConsulta = tipo;
    }
}