package br.edu.fatecpg.usafa.features.admin.controllers.Home;

import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentDto;
import br.edu.fatecpg.usafa.features.admin.dtos.home.HomeContentRequestDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Home.IHomeContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/home/content")
@RequiredArgsConstructor
public class HomeController {

    private final IHomeContentService homeService;

    // Endpoint PÚBLICO (Aberto)
    @GetMapping("/public")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HomeContentDto>> getPublicContent() {
        return ResponseEntity.ok(homeService.findPublicContent());
    }

    // Endpoint ADMIN (Protegido)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HomeContentDto>> getAdminContent() {
        return ResponseEntity.ok(homeService.findAllForAdmin());
    }

    // CREATE
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeContentDto> createContent(
            @ModelAttribute HomeContentRequestDto request, // Agrupa os campos de texto
            @RequestPart(value = "file", required = false) MultipartFile file // Arquivo separado
    ) {
        return ResponseEntity.status(201).body(homeService.create(request, file));
    }

    // UPDATE
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomeContentDto> updateContent(
            @PathVariable Long id,
            @ModelAttribute HomeContentRequestDto request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(homeService.update(id, request, file));
    }

    // DELETE (Mantém igual)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        homeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}