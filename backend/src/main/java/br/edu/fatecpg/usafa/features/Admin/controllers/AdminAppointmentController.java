package br.edu.fatecpg.usafa.features.Admin.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;

import java.util.List;

@RestController
@RequestMapping("/admin/appointments") // Endpoint base 
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAppointmentController {

    private final IAppointmentService appointmentService;

    /**
     * Busca todas as consultas.
     * Mapeia: getAppointments() [cite: 16]
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * Cria uma nova consulta.
     * Mapeia: createAppointment() [cite: 17]
     */
    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto appointmentDto) {
        AppointmentResponseDto newAppointment = appointmentService.createAppointment(appointmentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAppointment);
    }

    /**
     * Atualiza uma consulta existente.
     * Mapeia: updateAppointment() [cite: 18]
     */
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable String id,
            @Valid @RequestBody AppointmentRequestDto appointmentDto) {
        AppointmentResponseDto updatedAppointment = appointmentService.updateAppointment(id, appointmentDto);
        return ResponseEntity.ok(updatedAppointment);
    }

    /**
     * Deleta uma consulta.
     * Mapeia: deleteAppointment() [cite: 19]
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable String id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
