package br.edu.fatecpg.usafa.features.admin.dtos.home;

import lombok.Data;

@Data
public class HomeContentRequestDto {
    private String title;
    private String description;
    private String type;
    private Boolean isActive;
}
