package br.edu.fatecpg.usafa.features.consulta.controllers; // Ajuste o pacote

import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.FormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.models.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/consultas")
@RequiredArgsConstructor
@Slf4j
public class AppointmentController {

    private final IAppointmentService consultaService;
    private final UserUtils userUtils;

    /**
     * Endpoint para listar todas as consultas (Visão do Administrador).
     * Mapeado para GET /consultas
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AppointmentAdminResponseDTO>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search // Novo parâmetro opcional
    ) {
        Pageable pageable = PageRequest.of(page, size); // Pode adicionar sort se quiser
        return ResponseEntity.ok(consultaService.getAllAppointments(pageable, search));
    }

    /**
     * Endpoint para buscar o histórico de consultas confirmadas.
     * Retorna AppointmentUserResponseDTO (Visão do Paciente).
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<AppointmentUserResponseDTO>> getConsultasPorUsuario(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        Optional<User> userOptional = userUtils.getUserFromAuthentication(authentication);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userOptional.get();

        // Ordenação por data do slot (decrescente)
        Pageable pageable = PageRequest.of(page, size, Sort.by("horarioSlot.dataHoraInicio").descending());

        return ResponseEntity.ok(consultaService.findConsultasByUser(user, pageable));
    }

    /**
     * 1. FLUXO ADMIN: Agendamento Direto
     * O Admin escolhe o paciente e o horário, e a consulta já nasce "AGENDADA".
     */
    @PostMapping("/admin/agendar") // Mudei a rota para ficar explícito
    @PreAuthorize("hasRole('ADMIN')") // TRAVADO APENAS PARA ADMIN
    public ResponseEntity<AppointmentAdminResponseDTO> createAppointmentAdmin(
            @RequestBody @Valid AppointmentOperationDTO dto
    ) {
        // Como é Admin, passamos 'null' no segundo parâmetro.
        // Isso força o Service a buscar o paciente pelo ID que veio no JSON (dto.patientId).
        AppointmentAdminResponseDTO response = consultaService.createAppointment(dto, null);

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.getId())
                .toUri();

        return ResponseEntity.created(uri).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Garante que só admin pode editar dados sensíveis
    public ResponseEntity<AppointmentAdminResponseDTO> updateAppointment(
            @PathVariable String id,
            @RequestBody @Valid AppointmentOperationDTO dto
    ) {
        // Chama o método da service que já possui toda a regra de negócio
        AppointmentAdminResponseDTO response = consultaService.updateAppointment(id, dto);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Garante segurança conforme comentário no seu front
    public ResponseEntity<Void> deleteAppointment(@PathVariable String id) {
        consultaService.deleteAppointment(id);
        
        // Retorna 204 No Content (Sucesso, sem corpo de resposta)
        return ResponseEntity.noContent().build();
    }

    /**
     * Carrega opções iniciais do formulário (Médicos, Tipos).
     */
    @GetMapping("/options")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<FormOptionsDTO> getFormularioOptions() {
        return ResponseEntity.ok(consultaService.getFormOptions());
    }

    /**
     * Carga Dinâmica: Busca slots disponíveis quando o usuário escolhe a
     * especialidade.
     */
    @GetMapping("/horarios-disponiveis/{tipoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SelectOptionDTO>> getHorariosPorTipo(@PathVariable String tipoId) {
        return ResponseEntity.ok(consultaService.getHorariosDisponiveisPorTipo(tipoId));
    }
}