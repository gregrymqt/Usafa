package br.edu.fatecpg.usafa.features.admin.interfaces.Appointment;



import java.util.List;

import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeRequestDto;
import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;

public interface IAppointmentTypeService {
    List<AppointmentTypeResponseDto> getAll();
    AppointmentTypeResponseDto create(AppointmentTypeRequestDto requestDto);
    AppointmentTypeResponseDto update(String publicId, AppointmentTypeRequestDto requestDto);
    void delete(String publicId);
}