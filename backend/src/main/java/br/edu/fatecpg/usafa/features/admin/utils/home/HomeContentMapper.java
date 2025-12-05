package br.edu.fatecpg.usafa.features.admin.utils.home;

import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.models.HomeContent;
import br.edu.fatecpg.usafa.models.Picture;

@Component
public class HomeContentMapper {

    /**
     * Converte a Entidade (Banco) para DTO (Front)
     */
    public HomeContentDto toDto(HomeContent entity) {
        if (entity == null) return null;

        HomeContentDto dto = new HomeContentDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setType(entity.getType());
        dto.setIsActive(entity.getIsActive());

        // CORREÇÃO: Verificação de segurança (Null Check)
        // Se picture existir, pega a URL. Se não, manda null ou string vazia.
        if (entity.getPicture() != null) {
            // Supondo que você criou o helper que concatena a URL base
            // ou que getUrl() já retorna o caminho completo
            dto.setImageUrl(entity.getPicture().getUrl()); 
        }

        return dto;
    }

    /**
     * Converte o DTO (Front) para Entidade (Banco)
     * Útil se você receber o objeto completo no create/update
     */
    public HomeContent toEntity(HomeContentDto dto) {
        if (dto == null) {
            return null;
        }

        // Assumindo que sua Entity tem @Builder (Lombok)
        return HomeContent.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType())
                .picture(Picture.builder().url(dto.getImageUrl()).build())
                .isActive(dto.getIsActive())
                .build();
    }
}