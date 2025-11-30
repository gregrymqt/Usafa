package br.edu.fatecpg.usafa.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pictures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Picture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 1024)
    private String url;

    /**
     * Grupo ao qual a imagem pertence. Ex: "home", "perfil_paciente", "perfil_medico".
     * Este campo pode ser usado para organizar as imagens em pastas ou categorias.
     */
    @Column(name = "image_group", nullable = false, length = 50)
    private String group;
}