package br.edu.fatecpg.usafa.features.Admin.utils.appointment;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.doctor.DoctorResponseDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.patient.PatientResponseDto;
import br.edu.fatecpg.usafa.models.Consulta;

import java.time.LocalDateTime;

/**
 * Responsável por mapear a entidade Consulta para seus DTOs de resposta.
 * (Idealmente, usaria PatientMapper e DoctorMapper injetados)
 */
@Component
@RequiredArgsConstructor
public class AppointmentMapper {

    // Injeção dos outros mappers (quando você os criar)
    // private final PatientMapper patientMapper;
    // private final DoctorMapper doctorMapper;

    public AppointmentResponseDto toDto(Consulta consulta) {
        if (consulta == null) {
            return null;
        }

        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(consulta.getPublicId());
        dto.setDate(LocalDateTime.of(consulta.getDia(), consulta.getHorario()).toString());
        dto.setStatus(consulta.getStatus().toString());

        // --- Mapeamento de Entidades Aninhadas ---
        
        // Exemplo COM mappers (preferido)
        // dto.setPatient(patientMapper.toDto(consulta.getUser()));
        // dto.setDoctor(doctorMapper.toDto(consulta.getMedico()));

        // Exemplo SEM mappers (como estava antes)
        PatientResponseDto patientDto = new PatientResponseDto();
        patientDto.setId(consulta.getUser().getPublicId().toString());
        patientDto.setName(consulta.getUser().getName());
        patientDto.setEmail(consulta.getUser().getEmail());
        patientDto.setCpf(consulta.getUser().getCpf());
        // ...
        
        DoctorResponseDto doctorDto = new DoctorResponseDto();
        doctorDto.setId(consulta.getMedico().getPublicId());
        doctorDto.setName(consulta.getMedico().getNome());
        // ...

        dto.setPatient(patientDto);
        dto.setDoctor(doctorDto);

        return dto;
    }
}
