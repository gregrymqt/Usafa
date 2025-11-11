package br.edu.fatecpg.usafa.features.location.interfaces;

import br.edu.fatecpg.usafa.features.location.dtos.LocationCreateDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationUpdateDTO;

import java.util.Optional;

/**
 * Interface para o serviço de localização, definindo os métodos
 * necessários para o LocationController.
 */
public interface ILocationService {

    /**
     * Busca a USAFA salva de um usuário pelo seu ID público.
     *
     * @param publicId O ID público do usuário.
     * @return Um Optional contendo o LocationDTO se encontrado.
     */
    Optional<LocationDTO> findByUserPublicId(String publicId);

    /**
     * Cria um novo registro de USAFA para um usuário.
     *
     * @param locationCreateDTO DTO com os dados de criação.
     * @return O LocationDTO recém-criado.
     */
    LocationDTO create(LocationCreateDTO locationCreateDTO);

    /**
     * Atualiza um registro de USAFA existente.
     *
     * @param id O ID (PK) do registro da USAFA a ser atualizado.
     * @param locationUpdateDTO DTO com os novos dados.
     * @return Um Optional contendo o LocationDTO atualizado se encontrado.
     */
    Optional<LocationDTO> update(Long id, LocationUpdateDTO locationUpdateDTO);

}