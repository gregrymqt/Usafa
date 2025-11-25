package br.edu.fatecpg.usafa.features.location.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.edu.fatecpg.usafa.features.location.dtos.EnderecoResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

@RestController
@RequestMapping("/api/v1/maps")
public class MapsController {

    // 1. Instância do Logger
    private static final Logger logger = LoggerFactory.getLogger(MapsController.class);

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/geocode")
    public ResponseEntity<Object> getGeocode(@RequestParam String cep) {

        // LOG: Início do processo
        logger.info(">>> Iniciando busca de geolocalização para o CEP: {}", cep);

        String urlBrasilApi = "https://brasilapi.com.br/api/cep/v2/" + cep;

        try {
            // Chamada BrasilAPI
            logger.info("Chamando BrasilAPI: {}", urlBrasilApi);
            EnderecoResponse endereco = restTemplate.getForObject(urlBrasilApi, EnderecoResponse.class);
            logger.info("Resposta da BrasilAPI recebida com sucesso.");

            // Verificação de Coordenadas
            if (endereco != null) {
                Double lat = endereco.getLocation().getCoordinates().getLatitude();
                Double lon = endereco.getLocation().getCoordinates().getLongitude();

                if (lat == null || lon == null) {
                    // LOG: Fallback acionado
                    logger.warn(
                            "!!! Coordenadas NULL na BrasilAPI. Acionando fallback (Nominatim) para o endereço: {}, {}, {}",
                            endereco.getStreet(), endereco.getCity(), endereco.getState());

                    String query = String.format("%s, %s, %s, %s, Brazil",
                            endereco.getStreet(),
                            endereco.getNeighborhood(), // <--- O PULO DO GATO
                            endereco.getCity(),
                            endereco.getState());

                    buscarCoordenadasNoNominatim(query, endereco);
                } else {
                    logger.info("Coordenadas encontradas via BrasilAPI: Lat={}, Lon={}", lat, lon);
                }
            } else {
                logger.error("Objeto EnderecoResponse veio NULO da BrasilAPI.");
            }

            return ResponseEntity.ok(endereco);

        } catch (HttpClientErrorException e) {
            logger.error("Erro HTTP ao chamar BrasilAPI (Status: {}): {}", e.getStatusCode(), e.getMessage());

            if (e.getStatusCode().value() == 404) {
                return ResponseEntity.status(404).body("CEP não encontrado.");
            }
            return ResponseEntity.status(500).body("Erro na BrasilAPI.");

        } catch (Exception e) {
            logger.error("Erro genérico/inesperado no Controller: ", e);
            return ResponseEntity.status(500).body("Erro interno no servidor: " + e.getMessage());
        }
    }

    private void buscarCoordenadasNoNominatim(String enderecoTexto, EnderecoResponse enderecoObj) {
        try {
            logger.info("Consultando Nominatim (OpenStreetMap) com query: {}", enderecoTexto);

            String urlNominatim = "https://nominatim.openstreetmap.org/search?q=" +
                    enderecoTexto + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "GregCompanyProject/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // CORREÇÃO: Pedimos String.class em vez de JsonNode.class
            ResponseEntity<String> response = restTemplate.exchange(
                    urlNominatim, HttpMethod.GET, entity, String.class);

            // Verificamos se tem corpo na resposta
            if (response.getBody() != null) {
                // Convertemos manualmente aqui. É mais seguro.
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());

                if (root.isArray() && !root.isEmpty()) {
                    JsonNode primeiroResultado = root.get(0);

                    Double lat = primeiroResultado.get("lat").asDouble();
                    Double lon = primeiroResultado.get("lon").asDouble();

                    logger.info(">>> Sucesso no Nominatim! Lat: {}, Lon: {}", lat, lon);

                    // Atualiza o objeto original
                    enderecoObj.getLocation().getCoordinates().setLatitude(lat);
                    enderecoObj.getLocation().getCoordinates().setLongitude(lon);
                } else {
                    logger.warn("Nominatim retornou lista vazia para: {}", enderecoTexto);
                }
            }
        } catch (Exception ex) {
            logger.error("FALHA CRÍTICA no fallback do Nominatim: ", ex);
        }
    }
}