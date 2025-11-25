package br.edu.fatecpg.usafa.features.location.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true) // Ignora campos que você não mapeou (segurança)
public class EnderecoResponse {

    private String cep;
    private String state;
    private String city;
    private String neighborhood;
    private String street;
    private String service; // Ex: correios, opencep

    // Objeto aninhado para pegar a localização
    private Location location;

    @Data
    public static class Location {
        private String type;
        private Coordinates coordinates;
    }

    @Data
    public static class Coordinates {
        // A API pode retornar como String ou Double, o Jackson converte automático se possível
        private Double longitude;
        private Double latitude;
    }
}
