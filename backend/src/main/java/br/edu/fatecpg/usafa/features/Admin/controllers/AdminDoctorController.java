package br.edu.fatecpg.usafa.features.Admin.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IDoctorService;

import java.util.List;

@RestController
@RequestMapping("/admin/doctors") // Endpoint base 
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminDoctorController {

    private final IDoctorService doctorService;

    /**
     * Busca todos os médicos.
     * Mapeia: getDoctors() [cite: 10]
     */
    @GetMapping
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {
        List<DoctorResponseDto> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    /**
     * Cria um novo médico.
     * Mapeia: createDoctor() [cite: 11]
     */
    @PostMapping
    public ResponseEntity<DoctorResponseDto> createDoctor(@Valid @RequestBody DoctorRequestDto doctorDto) {
        DoctorResponseDto newDoctor = doctorService.createDoctor(doctorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDoctor);
    }

    /**
     * Atualiza um médico existente.
     * Mapeia: updateDoctor() [cite: 12]
     */
    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> updateDoctor(
            @PathVariable String id,
            @Valid @RequestBody DoctorRequestDto doctorDto) {
        DoctorResponseDto updatedDoctor = doctorService.updateDoctor(id, doctorDto);
        return ResponseEntity.ok(updatedDoctor);
    }

    /**
     * Deleta um médico.
     * Mapeia: deleteDoctor() [cite: 13]
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }
}
