package br.edu.fatecpg.usafa.features.admin.utils.appointmentType;

import br.edu.fatecpg.usafa.features.admin.dtos.appointmentType.AppointmentTypeResponseDto;
import br.edu.fatecpg.usafa.models.TipoConsulta;

public class AppointmentTypeHelper {

    public AppointmentTypeResponseDto toDto(TipoConsulta tipoConsulta) {
        AppointmentTypeResponseDto dto = new AppointmentTypeResponseDto();
        dto.setPublicId(tipoConsulta.getPublicId());
        dto.setNome(tipoConsulta.getNome());
        return dto;
    }

}
