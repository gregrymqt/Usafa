package br.edu.fatecpg.usafa.features.admin.interfaces.Appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.dtos.AppointmentRequestDto;
import br.edu.fatecpg.usafa.models.User;

/**
 * Interface (Contrato) para o serviço de Consultas/Agendamentos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IAppointmentService {

    Page<AppointmentResponseDto> getAllAppointments(Pageable pageable);

    AppointmentResponseDto createAppointment(AppointmentRequestDto requestDTO, User user);

    AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto);

    void deleteAppointment(String id);

}
