package br.edu.fatecpg.usafa.features.consulta.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para representar os dados de uma solicitação de consulta (documento do MongoDB)
 * que são enviados como resposta pela API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestAppointmentResponseDto {

    private String id;

    // Dados da Requisição
    private String sintomas;
    private LocalDate dia;
    private LocalTime horario;
    private String status;

    // IDs de referência do banco SQL
    private String userPublicId;
    private String medicoPublicId;
    private String tipoConsultaPublicId;

    // Dados desnormalizados (para evitar JOINS no frontend)
    private String patientName;
    private String doctorName;
    private String appointmentTypeName;

}