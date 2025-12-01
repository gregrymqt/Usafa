package br.edu.fatecpg.usafa.features.admin.controllers.Appointment;

import java.util.List;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.document.RequestAppointment;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentConsumerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/requisicao/appointments") // Endpoint para gerenciar as solicitações
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // Protege a controller inteira
public class AppointmentConsumerController {

    // 1. Consome a INTERFACE, não a implementação
    private final IAppointmentConsumerService adminConsultaService;

    /**
     * (Admin) GET /admin/consultas
     * Busca todas as solicitações de consulta do MongoDB de forma paginada.
     */
    @GetMapping
    public ResponseEntity<Page<RequestAppointment>> getAllConsultaRequests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable
    ) {
        // Passa ambos os filtros para o serviço
        Page<RequestAppointment> requestsPage = adminConsultaService.getAllConsultaRequests(search, status, pageable);
        return ResponseEntity.ok(requestsPage);
    }

    /**
     * (Admin) PATCH /admin/requisicao/appointments/{id}
     * Atualiza o status, dia ou horário de uma solicitação.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<RequestAppointment> updateConsulta(
            @PathVariable String id,
            @RequestBody UpdateAppointmentDTO appointmentDTO
    ) {
        // O DTO [cite: 1] e o endpoint  já estavam corretos.
        RequestAppointment updatedDoc = adminConsultaService.updateConsultaStatus(id, appointmentDTO);
        return ResponseEntity.ok(updatedDoc);
    }

    /**
     * (Admin) DELETE /admin/requisicao/appointments/{id}
     * Deleta uma solicitação da fila (ex: spam ou erro).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsultaRequest(@PathVariable String id) {
        adminConsultaService.deleteConsultaRequest(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content
    }
}
