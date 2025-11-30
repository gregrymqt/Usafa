package br.edu.fatecpg.usafa.features.admin.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;
import br.edu.fatecpg.usafa.features.admin.interfaces.Appointment.IAppointmentTypeService;

import java.util.List;

@RestController
@RequestMapping("/tipos-consulta")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AppointmentTypeController {

    private final IAppointmentTypeService appointmentTypeService;

    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponseDto>> getAll() {
        return ResponseEntity.ok(appointmentTypeService.getAll());
    }

    @PostMapping
    public ResponseEntity<AppointmentTypeResponseDto> create(@Valid @RequestBody AppointmentTypeRequestDto requestDto) {
        return new ResponseEntity<>(appointmentTypeService.create(requestDto), HttpStatus.CREATED);
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<AppointmentTypeResponseDto> update(@PathVariable String publicId, @Valid @RequestBody AppointmentTypeRequestDto requestDto) {
        return ResponseEntity.ok(appointmentTypeService.update(publicId, requestDto));
    }

    @DeleteMapping("/{publicId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String publicId) {
        appointmentTypeService.delete(publicId);
    }
}
