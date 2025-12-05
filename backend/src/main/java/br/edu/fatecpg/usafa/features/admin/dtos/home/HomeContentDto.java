package br.edu.fatecpg.usafa.features.admin.dtos.home;

import br.edu.fatecpg.usafa.models.enums.ContentType;
import lombok.Data;

@Data
public class HomeContentDto {
    private Long id;
    private ContentType type; // O Jackson serializa Enum para String automaticamente
    private String title;
    private String description;
    private String imageUrl; // O front espera "imageUrl", não objeto Picture
    private Boolean isActive;
}