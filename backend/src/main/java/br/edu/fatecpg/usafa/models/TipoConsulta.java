package br.edu.fatecpg.usafa.models;


import jakarta.persistence.*;
import lombok.Data;
import java.util.Set;

@Data
@Entity
@Table(name = "tipos_consulta")
public class TipoConsulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String publicId;
    @Column(nullable = false, unique = true)
    private String nome; // (ex: "Cardiologia")

    // --- RELACIONAMENTO INVERSO ADICIONADO ---
    // Permite buscar todos os médicos de uma especialidade.
    // (ex: tipoConsulta.getMedicos())
    @OneToMany(mappedBy = "tipoConsulta")
    private Set<Medico> medicos;
    
    @OneToMany(mappedBy = "tipoConsulta")
    private Set<Consulta> consultas;
}
