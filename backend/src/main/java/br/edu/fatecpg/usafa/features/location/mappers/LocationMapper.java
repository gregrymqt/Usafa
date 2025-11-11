package br.edu.fatecpg.usafa.features.location.mappers;

import br.edu.fatecpg.usafa.features.location.dtos.LocationCreateDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationDTO;
import br.edu.fatecpg.usafa.models.Usafa;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper (usando MapStruct) para converter entre a entidade Usafa e seus DTOs.
 * * componentModel = "spring" faz com que o MapStruct gere um @Component
 * gerenciado pelo Spring, permitindo que seja injetado no LocationService.
 * * unmappedTargetPolicy = ReportingPolicy.IGNORE ignora avisos sobre
 * campos que não estão sendo mapeados (como 'user' no DTO).
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LocationMapper {

    /**
     * Converte a entidade Usafa para o LocationDTO (para enviar ao frontend).
     *
     * @param usafa A entidade do banco de dados.
     * @return O DTO correspondente.
     */
    @Mapping(source = "user.publicId", target = "userPublicId")
    LocationDTO toDTO(Usafa usafa);

    /**
     * Converte o LocationCreateDTO (vindo do frontend) para a entidade Usafa.
     * * Nota: O campo 'user' e 'userPublicId' são ignorados aqui.
     * O 'LocationService' é responsável por buscar a entidade 'User'
     * e associá-la à Usafa.
     *
     * @param createDTO O DTO de criação.
     * @return A nova entidade Usafa (ainda sem o 'user' associado).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Usafa fromCreateDTO(LocationCreateDTO createDTO);
    
}