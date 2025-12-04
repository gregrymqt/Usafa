package br.edu.fatecpg.usafa.features.admin.controllers.Patient;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.features.admin.dtos.patient.PatientSearchCpfRequestDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Patient.IPatientService;

import java.util.List;

@RestController
@RequestMapping("/admin/patients") // Endpoint base 
@RequiredArgsConstructor // Para injeção de dependência do service
public class PatientController {

    private final IPatientService patientService;

    /**
     * Busca pacientes de forma paginada e com filtro de busca.
     * GET /admin/patients?page=0&size=10&search=termo
     * Mapeia: getPatients()
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<PatientResponseDto>> getAllPatients(
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable) {
        Page<PatientResponseDto> patients = patientService.getAllPatients(search, pageable);
        return ResponseEntity.ok(patients);
    }

    /**
     * Busca um paciente específico pelo CPF de forma segura.
     * POST /admin/patients/search-by-cpf
     * Mapeia: searchPatientByCpf()
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/search-by-cpf")
    public ResponseEntity<List<PatientResponseDto>> searchPatientByCpf(@Valid @RequestBody PatientSearchCpfRequestDto dto) {
        List<PatientResponseDto> result = patientService.searchByCpf(dto.getCpf());
        return ResponseEntity.ok(result);
    }

    /**
     * Cria um novo paciente.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PatientResponseDto> createPatient(@Valid @RequestBody PatientRequestDto patientDto) {
        PatientResponseDto newPatient = patientService.createPatient(patientDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newPatient);
    }

    /**
     * Atualiza um paciente existente.
     * Mapeia: updatePatient() [cite: 5]
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(
            @PathVariable String id,
            @Valid @RequestBody PatientRequestDto patientDto) {
        PatientResponseDto updatedPatient = patientService.updatePatient(id, patientDto);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Deleta um paciente.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
