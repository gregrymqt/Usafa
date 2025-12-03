package br.edu.fatecpg.usafa.features.admin.dtos.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRequestDto {

    // O "quem" (Paciente).
    // Nota: Se for o próprio paciente logado agendando, você pode pegar isso do Token JWT no controller.
    // Se for um ADMIN agendando, este campo é obrigatório.
    @NotBlank(message = "O paciente é obrigatório")
    private String patientId; // O publicId do User [cite: 66]

    // O "quando" e o "com quem" (Médico) agora são resolvidos por um único ID.
    // O slot amarra: Data + Hora + Médico.
    @NotNull(message = "O horário selecionado é obrigatório")
    private String horarioSlotId; // O ID do HorarioSlot [cite: 69, 76]

    // O "o quê" (Especialidade/Tipo).
    // Necessário pois a entidade Consulta exige um relacionamento com TipoConsulta.
    @NotBlank(message = "O tipo de consulta é obrigatório")
    private String tipoConsultaId; // O publicId do TipoConsulta 

    // Opcional: Motivo da consulta (importante para UX médica)
    @Size(max = 500, message = "A descrição dos sintomas deve ter no máximo 500 caracteres")
    private String sintomas; // 

    @NotBlank(message = "O status da consulta é obrigatório")
    private String status;
    
}