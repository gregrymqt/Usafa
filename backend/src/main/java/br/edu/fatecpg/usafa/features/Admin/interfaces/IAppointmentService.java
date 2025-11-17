package br.edu.fatecpg.usafa.features.Admin.interfaces;

import java.util.List;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentRequestDto;
import br.edu.fatecpg.usafa.features.Admin.dtos.appointment.AppointmentResponseDto;
import br.edu.fatecpg.usafa.features.consulta.dtos.ConsultaSummaryDTO;
import br.edu.fatecpg.usafa.models.User;

/**
 * Interface (Contrato) para o serviço de Consultas/Agendamentos.
 * Define O QUE pode ser feito, mas não COMO é feito.
 */
public interface IAppointmentService {

    List<AppointmentResponseDto> getAllAppointments();

    ConsultaSummaryDTO createAppointment(AppointmentRequestDto requestDTO, User user);

    AppointmentResponseDto updateAppointment(String id, AppointmentRequestDto appointmentDto);

    void deleteAppointment(String id);

}
