package br.edu.fatecpg.usafa.features.admin.controllers.Doctor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Doctor.IDoctorService;


@RestController
@RequestMapping("/admin/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final IDoctorService doctorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DoctorResponseDto>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        // [MELHORIA] Adicionei ordenação por padrão (Nome Crescente)
        Pageable pageable = PageRequest.of(page, size, Sort.by("nome").ascending());
        
        Page<DoctorResponseDto> doctors = doctorService.getAllDoctors(pageable, search);
        return ResponseEntity.ok(doctors);
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDto> createDoctor(
            @Valid @RequestPart("doctor") DoctorRequestDto doctorDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        DoctorResponseDto newDoctor = doctorService.createDoctor(doctorDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDoctor);
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorResponseDto> updateDoctor(
            @PathVariable String id,
            @Valid @RequestPart("doctor") DoctorRequestDto doctorDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        DoctorResponseDto updatedDoctor = doctorService.updateDoctor(id, doctorDto, file);
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}