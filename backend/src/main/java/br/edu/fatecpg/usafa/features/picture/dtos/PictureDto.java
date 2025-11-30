package br.edu.fatecpg.usafa.features.picture.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PictureDto {
    private String id;
    private String title;
    private String url;
    private String group;
}
