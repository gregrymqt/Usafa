package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Data
@Entity
@Table(name = "medicos")
public class Medico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String publicId;
    private String nome;

    // --- RELACIONAMENTO ADICIONADO ---
    // Esta é a "especialidade" do médico.
    // Múltiplos médicos podem ter o mesmo TipoConsulta (especialidade).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_consulta_id", nullable = false)
    private TipoConsulta tipoConsulta;
    
    @OneToMany(mappedBy = "medico")
    private Set<Consulta> consultas;
}
