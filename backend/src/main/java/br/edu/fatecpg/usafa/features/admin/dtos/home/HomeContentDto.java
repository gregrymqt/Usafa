package br.edu.fatecpg.usafa.features.admin.dtos.home;

import br.edu.fatecpg.usafa.models.enums.ContentType;
import lombok.Data;

@Data
public class HomeContentDto {
    private Long id;
    private ContentType type;
    private String title;
    private String description;
    private String imageUrl;
    private Boolean isActive;
}