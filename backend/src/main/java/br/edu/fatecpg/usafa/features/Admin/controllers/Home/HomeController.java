package br.edu.fatecpg.usafa.features.admin.controllers.Home;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Home.IHomeContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/home/content") // Endpoint padronizado
@RequiredArgsConstructor
public class HomeController {

    private final IHomeContentService homeService; // Service do Java (não o do picture)

    // --- READ (Público) ---
    @GetMapping
    public ResponseEntity<List<HomeContentDto>> getAllContent() {
        List<HomeContentDto> content = homeService.findAll();
        return ResponseEntity.ok(content);
    }

    // --- CREATE (Admin) ---
    // Recebe MultipartFile (imagem) + Parâmetros via Form Data
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<HomeContentDto> createContent(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam("isActive") Boolean isActive,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        // Crie um DTO ou passe os dados para o service
        HomeContentDto newContent = homeService.create(title, description, type, isActive, file);
        return ResponseEntity.status(201).body(newContent);
    }

    // --- UPDATE (Admin) ---
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeContentDto> updateContent(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        HomeContentDto updated = homeService.update(id, title, description, type, isActive, file);
        return ResponseEntity.ok(updated);
    }

    // --- DELETE (Admin) ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        homeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}