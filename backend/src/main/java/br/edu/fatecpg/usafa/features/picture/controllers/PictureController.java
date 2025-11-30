package br.edu.fatecpg.usafa.features.picture.controllers;

import br.edu.fatecpg.usafa.features.picture.dtos.PictureDto;
import br.edu.fatecpg.usafa.features.picture.services.PictureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/pictures")
@RequiredArgsConstructor
public class PictureController {

    private final PictureService pictureService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PictureDto> create(@RequestBody PictureDto pictureDto) {
        PictureDto newPicture = pictureService.create(pictureDto);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(newPicture.getId())
                .toUri();

        return ResponseEntity.created(location).body(newPicture);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<PictureDto>> findAll(
            @RequestParam(required = false) String group,
            @RequestParam(required = false) String title
    ) {
        List<PictureDto> pictures;
        if (group != null) {
            pictures = pictureService.findByGroup(group);
        } else if (title != null) {
            pictures = pictureService.findByTitle(title);
        } else {
            pictures = pictureService.findAll();
        }
        return ResponseEntity.ok(pictures);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PictureDto> findById(@PathVariable Long id) {
        PictureDto picture = pictureService.findById(id);
        return ResponseEntity.ok(picture);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PictureDto> update(@PathVariable Long id, @RequestBody PictureDto pictureDto) {
        PictureDto updatedPicture = pictureService.update(id, pictureDto);
        return ResponseEntity.ok(updatedPicture);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        pictureService.delete(id);
    }
}
