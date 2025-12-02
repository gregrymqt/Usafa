package br.edu.fatecpg.usafa.features.admin.controllers.timeSlot;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot.IHorarioSlotService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/slots")
@RequiredArgsConstructor
public class AdminSlotController {

    private final IHorarioSlotService slotService;

    @PostMapping("/gerar")
    @PreAuthorize("hasRole('ADMIN')") // Garante que só Admin (ou Médico) acesse
    public ResponseEntity<Void> gerarAgenda(@RequestBody GerarAgendaDTO dto) {
        slotService.gerarAgenda(dto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> atualizarSlot(@PathVariable Long id, @RequestBody AtualizarSlotDTO dto) {
        slotService.atualizarSlot(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> excluirSlot(@PathVariable Long id) {
        slotService.excluirSlot(id);
        return ResponseEntity.noContent().build();
    }
}
