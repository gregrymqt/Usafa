package br.edu.fatecpg.usafa.features.Admin.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaFormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IConsultaService;

import java.util.List;

/**
 * (Admin) Controller para o CRUD síncrono de Agendamentos (Appointments) no SQL.
 * Gerencia agendamentos que o admin cria ou modifica diretamente.
 */
@RestController
@RequestMapping("/admin/appointments") // Endpoint base [cite: 57]
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AppointmentController {

    private final IAppointmentService adminAppointmentService;
    
    /**
     * GET /admin/appointments
     * Busca todos os agendamentos. [cite: 58-59]
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = adminAppointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * POST /admin/appointments
     * Cria um novo agendamento. [cite: 60]
     */
    @PostMapping
    public ResponseEntity<ConsultaSummaryDTO> createAppointment(
            @Valid @RequestBody AppointmentRequestDto appointmentData
    ) {
        ConsultaSummaryDTO newAppointment = adminAppointmentService.createAppointment(appointmentData, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAppointment);
    }

    /**
     * PUT /admin/appointments/{id}
     * Atualiza um agendamento existente. [cite: 61]
     */
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable String id, // Usando String/UUID para o publicId
            @Valid @RequestBody AppointmentRequestDto appointmentData
    ) {
        AppointmentResponseDto updatedAppointment = adminAppointmentService.updateAppointment(id, appointmentData);
        return ResponseEntity.ok(updatedAppointment);
    }

    /**
     * DELETE /admin/appointments/{id}
     * Deleta um agendamento. [cite: 62]
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable String id) {
        adminAppointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}