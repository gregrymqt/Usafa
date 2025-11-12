package br.edu.fatecpg.usafa.features.Admin.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IPatientService;

import java.util.List;

@RestController
@RequestMapping("/admin/patients") // Endpoint base 
@RequiredArgsConstructor // Para injeção de dependência do service
@CrossOrigin(origins = "*") // Permite requisições do seu front-end
public class AdminPatientController {

    private final IPatientService patientService;

    /**
     * Busca todos os pacientes.
     * Mapeia: getPatients() [cite: 3]
     */
    @GetMapping
    public ResponseEntity<List<PatientResponseDto>> getAllPatients() {
        List<PatientResponseDto> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    /**
     * Cria um novo paciente.
     * Mapeia: createPatient() [cite: 4]
     */
    @PostMapping
    public ResponseEntity<PatientResponseDto> createPatient(@Valid @RequestBody PatientRequestDto patientDto) {
        PatientResponseDto newPatient = patientService.createPatient(patientDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPatient);
    }

    /**
     * Atualiza um paciente existente.
     * Mapeia: updatePatient() [cite: 5]
     */
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(
            @PathVariable String id,
            @Valid @RequestBody PatientRequestDto patientDto) {
        PatientResponseDto updatedPatient = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Deleta um paciente.
     * Mapeia: deletePatient() [cite: 6]
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
