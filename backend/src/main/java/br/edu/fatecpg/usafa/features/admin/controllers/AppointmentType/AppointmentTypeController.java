package br.edu.fatecpg.usafa.features.admin.controllers.AppointmentType;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.AppointmentType.IAppointmentTypeService;

import java.util.List;

@RestController
@RequestMapping("/tipos-consulta")
@RequiredArgsConstructor
public class AppointmentTypeController {

    private final IAppointmentTypeService appointmentTypeService;
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponseDto>> getAll() {
        return ResponseEntity.ok(appointmentTypeService.getAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<AppointmentTypeResponseDto> create(@Valid @RequestBody AppointmentTypeRequestDto requestDto) {
        return new ResponseEntity<>(appointmentTypeService.create(requestDto), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{publicId}")
    public ResponseEntity<AppointmentTypeResponseDto> update(@PathVariable String publicId, @Valid @RequestBody AppointmentTypeRequestDto requestDto) {
        return ResponseEntity.ok(appointmentTypeService.update(publicId, requestDto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{publicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String publicId) {
        appointmentTypeService.delete(publicId);
    }
    
}
