package br.edu.fatecpg.usafa.features.Admin.interfaces;

import java.util.List;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;

/**
 * Interface (Contrato) para o serviço de Consultas/Agendamentos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IAppointmentService {

    List<AppointmentResponseDto> getAllAppointments();

    AppointmentResponseDto createAppointment(AppointmentRequestDto appointmentDto);

    AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto);

    void deleteAppointment(String id);

    // Você pode adicionar outros métodos de contrato aqui, ex:
    // AppointmentResponseDto getAppointmentById(String id);
    // List<AppointmentResponseDto> getAppointmentsByPatientId(String patientId);
}
