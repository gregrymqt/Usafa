package br.edu.fatecpg.usafa.features.admin.interfaces.Appointment;

import java.util.List;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.models.User;

/**
 * Interface (Contrato) para o serviço de Consultas/Agendamentos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IAppointmentService {

    List<AppointmentResponseDto> getAllAppointments();

    AppointmentResponseDto createAppointment(AppointmentRequestDto requestDTO, User user);

    AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto);

    void deleteAppointment(String id);

}
