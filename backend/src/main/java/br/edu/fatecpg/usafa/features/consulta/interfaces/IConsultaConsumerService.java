package br.edu.fatecpg.usafa.features.consulta.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;

public interface IConsultaConsumerService {

    Page<RequestAppointmentResponseDto> findByUserPublicIdAndStatus(String userPublicId, String status, Pageable pageable);

}
