package br.edu.fatecpg.usafa.features.admin.controllers.timeSlot;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.AtualizarSlotDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.GerarAgendaDTO;
import br.edu.fatecpg.usafa.features.admin.dtos.timeSlot.SlotResponseDTO;
import br.edu.fatecpg.usafa.features.admin.interfaces.timeSlot.IHorarioSlotService;
import br.edu.fatecpg.usafa.models.HorarioSlot;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/slots")
@RequiredArgsConstructor
public class AdminSlotController {

    private final IHorarioSlotService slotService;

    @GetMapping("/medico/{medicoId}") // 
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SlotResponseDTO>> listarSlotsPorMedico(
            @PathVariable String medicoId,
            @RequestParam(required = false) String data // [NOVO] Lê ?data=2025-12-05
    ) {
        // Passamos a data (que pode ser nula) para o service
        List<HorarioSlot> slots = slotService.listarSlotsPorMedico(medicoId, data);

        List<SlotResponseDTO> dtos = slots.stream()
                .map(slot -> SlotResponseDTO.builder()
                        .id(slot.getId())
                        .medicoId(slot.getMedico().getPublicId())
                        .dataHoraInicio(slot.getDataHoraInicio().toString())
                        .dataHoraFim(slot.getDataHoraFim().toString())
                        .status(slot.getStatus().name())
                        .build())
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/gerar")
    @PreAuthorize("hasRole('ADMIN')") // Garante que só Admin (ou Médico) acesse
    public ResponseEntity<Void> gerarAgenda(@RequestBody GerarAgendaDTO dto) {
        slotService.gerarAgenda(dto);
        return ResponseEntity.noContent().build(); 
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
