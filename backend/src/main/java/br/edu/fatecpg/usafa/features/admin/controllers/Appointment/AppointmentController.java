package br.edu.fatecpg.usafa.features.admin.controllers.Appointment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentService;


/**
 * (Admin) Controller para o CRUD síncrono de Agendamentos (Appointments) no
 * SQL.
 * Gerencia agendamentos que o admin cria ou modifica diretamente.
 */
@RestController
@RequestMapping("/admin/appointments") // Endpoint base [cite: 57]
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AppointmentController {

    private final IAppointmentService adminAppointmentService;

   @GetMapping
    public ResponseEntity<Page<AppointmentResponseDto>> getAllAppointments(
            @PageableDefault(size = 10, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        // Agora passamos o pageable para a service
        Page<AppointmentResponseDto> appointments = adminAppointmentService.getAllAppointments(pageable);
        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(@Valid @RequestBody AppointmentRequestDto appointmentData) {
        // Passamos 'null' como usuário, pois a Service vai pegar o ID do paciente de dentro do DTO
        AppointmentResponseDto newAppointment = adminAppointmentService.createAppointment(appointmentData, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(newAppointment);
    }

    /**
     * PUT /admin/appointments/{id}
     * Atualiza um agendamento existente. [cite: 61]
     */
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable String id, // Usando String/UUID para o publicId
            @Valid @RequestBody AppointmentRequestDto appointmentData) {
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