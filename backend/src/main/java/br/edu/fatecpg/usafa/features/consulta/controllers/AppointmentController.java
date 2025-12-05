package br.edu.fatecpg.usafa.features.consulta.controllers; // Ajuste o pacote

import br.edu.fatecpg.usafa.features.auth.utilis.UserUtils;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.FormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.interfaces.IAppointmentService;
import br.edu.fatecpg.usafa.models.User;
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

        // Segurança: Apenas Admin pode ver consultas de outros IDs
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getPublicId().toString().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Ordenação por data do slot (decrescente)
        Pageable pageable = PageRequest.of(page, size, Sort.by("horarioSlot.dataHoraInicio").descending());

        return ResponseEntity.ok(consultaService.findConsultasByUser(user, pageable));
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
     * Carga Dinâmica: Busca slots disponíveis quando o usuário escolhe a especialidade.
     */
    @GetMapping("/horarios-disponiveis/{tipoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SelectOptionDTO>> getHorariosPorTipo(@PathVariable String tipoId) {
        return ResponseEntity.ok(consultaService.getHorariosDisponiveisPorTipo(tipoId));
    }
}