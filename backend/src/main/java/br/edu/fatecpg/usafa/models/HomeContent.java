package br.edu.fatecpg.usafa.models;

import br.edu.fatecpg.usafa.models.enums.ContentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_home_content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT") 
    private String description;

    // ALTERAÇÃO: Join com a tabela Picture em vez de string solta
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "picture_id", referencedColumnName = "id")
    private Picture picture;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
