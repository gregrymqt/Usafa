package br.edu.fatecpg.usafa.features.Admin.utils.appointment;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.Admin.utils.doctor.DoctorMapper;
import br.edu.fatecpg.usafa.features.Admin.utils.patient.PatientMapper;
import br.edu.fatecpg.usafa.models.Consulta;

import java.time.LocalDateTime;

/**
 * Responsável por mapear a entidade Consulta para seus DTOs de resposta.
 * (Idealmente, usaria PatientMapper e DoctorMapper injetados)
 */

@Component
@RequiredArgsConstructor
public class AppointmentMapper {

    // 1. Injeção dos outros mappers (Agora descomentados e obrigatórios)
    private final PatientMapper patientMapper;
    private final DoctorMapper doctorMapper;

    public AppointmentResponseDto toDto(Consulta consulta) {
        if (consulta == null) {
            return null; 
        }

        AppointmentResponseDto dto = new AppointmentResponseDto();
        
        // Dados básicos da consulta
        dto.setId(consulta.getPublicId());
        dto.setStatus(consulta.getStatus().toString());

        // 2. CORREÇÃO CRÍTICA: Data e Hora vêm do HorarioSlot
        // Substitui o antigo consulta.getDia() / getHorario() 
        if (consulta.getHorarioSlot() != null) {
            LocalDateTime dataHora = consulta.getHorarioSlot().getDataHoraInicio();
            dto.setDate(dataHora.toString()); // Formato ISO (ex: "2025-11-18T10:00:00")
        } else {
            dto.setDate(null); // Ou trate como erro se slot for obrigatório
        }

        // 3. Uso dos Mappers Injetados (Substitui o bloco manual enorme anterior)
        // O PatientMapper já cuida do User -> PatientResponseDto [cite: 51]
        dto.setPatient(patientMapper.toDto(consulta.getUser())); 

        // O DoctorMapper já cuida do Medico -> DoctorResponseDto [cite: 44]
        dto.setDoctor(doctorMapper.toDto(consulta.getMedico())); 

        return dto;
    }
}