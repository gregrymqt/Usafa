package br.edu.fatecpg.usafa.features.Admin.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.document.ConsultaDocument;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.UpdateStatusDTO;
import br.edu.fatecpg.usafa.features.Admin.interfaces.IAdminAppointmentConsumerService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/requisicao/appointments") // Endpoint para gerenciar as solicitações
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')") // Protege a controller inteira
public class AdminAppointmentConsumerController {

    // 1. Consome a INTERFACE, não a implementação
    private final IAdminAppointmentConsumerService adminConsultaService;

    /**
     * (Admin) GET /admin/consultas
     * Busca todas as solicitações de consulta do MongoDB.
     */
    @GetMapping
    public ResponseEntity<List<ConsultaDocument>> getAllConsultaRequests() {
        List<ConsultaDocument> requests = adminConsultaService.getAllConsultaRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * (Admin) PATCH /admin/consultas/{id}/status
     * Atualiza o status de uma consulta (ex: "ACEITA", "RECUSADA").
     * Usa o DTO 'UpdateStatusDTO'.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ConsultaDocument> updateConsultaStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusDTO statusDTO
    ) {
        ConsultaDocument updatedDoc = adminConsultaService.updateConsultaStatus(id, statusDTO.status());
        return ResponseEntity.ok(updatedDoc);
    }
}
