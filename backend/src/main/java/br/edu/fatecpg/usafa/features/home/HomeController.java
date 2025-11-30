package br.edu.fatecpg.usafa.features.home;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto;
import br.edu.fatecpg.usafa.features.picture.services.PictureService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/home/pictures") // Alterado para um endpoint mais específico da home
@RequiredArgsConstructor
public class HomeController {

    // Injetamos o PictureService que tem a lógica real de busca
    private final PictureService pictureService;

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<PictureDto>> findHomePictures() {
        // Chamamos diretamente o método para buscar pelo grupo "home"
        List<PictureDto> pictures = pictureService.findByGroup("home");
        return ResponseEntity.ok(pictures);
    }
}
