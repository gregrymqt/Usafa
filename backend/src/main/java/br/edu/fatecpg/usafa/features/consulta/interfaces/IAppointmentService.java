package br.edu.fatecpg.usafa.features.consulta.interfaces;




import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.FormOptionsDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.Options.SelectOptionDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;
import br.edu.fatecpg.usafa.models.User;

public interface IAppointmentService {

    // --- LEITURA ---
    Page<AppointmentUserResponseDTO> findConsultasByUser(User user, Pageable pageable);

    Page<AppointmentAdminResponseDTO> getAllAppointments(Pageable pageable, String search);

    FormOptionsDTO getFormOptions();

    List<SelectOptionDTO> getHorariosDisponiveisPorTipo(String tipoPublicId);

    // --- ESCRITA (Agora usa AppointmentOperationDTO) ---
    AppointmentAdminResponseDTO createAppointment(AppointmentOperationDTO operationDTO, User userLogado);

    AppointmentAdminResponseDTO updateAppointment(String id, AppointmentOperationDTO operationDTO);

    void deleteAppointment(String id);
}