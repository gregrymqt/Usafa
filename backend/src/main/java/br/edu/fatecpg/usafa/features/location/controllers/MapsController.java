package br.edu.fatecpg.usafa.features.location.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/v1/maps")
public class MapsController {

    // Injeta a chave da API a partir do application.properties
    @Value("${app.google.api-key}")
    private String googleApiKey;

    // Cliente HTTP para fazer a chamada para o Google
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/geocode")
    public ResponseEntity<String> getGeocode(@RequestParam String cep) {
        if (googleApiKey == null || googleApiKey.isEmpty() || googleApiKey.equals("${GOOGLE_API_KEY}")) {
            return ResponseEntity.status(500).body("A chave da API do Google não está configurada no servidor.");
        }

        String geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + cep + ", Brasil&key=" + googleApiKey;

        try {
            String response = restTemplate.getForObject(geoUrl, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao se comunicar com a API de geolocalização do Google.");
        }
    }
}