package br.edu.fatecpg.usafa.features.consulta.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;

public interface IAppointmentRequestService {

    void deleteRequest(String idStr);

    Page<RequestAppointmentResponseDto> getRequests(String userPublicId, String status, Pageable pageable);

    RequestAppointmentResponseDto updateStatus(String idStr, UpdateAppointmentDTO dto);

}
