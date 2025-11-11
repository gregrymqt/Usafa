package br.edu.fatecpg.usafa.features.location.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.location.dtos.LocationUpdateDTO;
import br.edu.fatecpg.usafa.features.location.interfaces.ILocationService;
import br.edu.fatecpg.usafa.features.location.dtos.LocationCreateDTO;
import br.edu.fatecpg.usafa.features.location.dtos.LocationDTO;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usafas")
@RequiredArgsConstructor // Cria um construtor com os campos 'final'
public class LocationController {

    private final ILocationService locationService;

    /**
     * GET /api/v1/usafas/user/{publicId}
     * Busca a USAFA salva para um usuário específico.
     * Corresponde a 'getSavedLocation' no seu api.ts.
     */
    @GetMapping("/user/{publicId}")
    public ResponseEntity<LocationDTO> getByUserPublicId(@PathVariable String publicId) {
        return locationService.findByUserPublicId(publicId)
                .map(ResponseEntity::ok) // Se encontrar, retorna 200 OK com o DTO
                .orElse(ResponseEntity.notFound().build()); // Se não, retorna 404 Not Found
    }

    /**
     * POST /api/v1/usafas
     * Cria uma nova USAFA para um usuário.
     * Corresponde a 'createSavedLocation' no seu api.ts.
     */
    @PostMapping
    public ResponseEntity<LocationDTO> create(@RequestBody LocationCreateDTO locationCreateDTO) {
        LocationDTO createdLocation = locationService.create(locationCreateDTO);
        return new ResponseEntity<>(createdLocation, HttpStatus.CREATED); // Retorna 201 Created
    }

    /**
     * PUT /api/v1/usafas/{id}
     * Atualiza uma USAFA existente.
     * Corresponde a 'updateSavedLocation' no seu api.ts.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LocationDTO> update(@PathVariable Long id, @RequestBody LocationUpdateDTO locationUpdateDTO) {
        return locationService.update(id, locationUpdateDTO)
                .map(ResponseEntity::ok) // Se atualizar, retorna 200 OK
                .orElse(ResponseEntity.notFound().build()); // Se não encontrar, retorna 404
    }
}