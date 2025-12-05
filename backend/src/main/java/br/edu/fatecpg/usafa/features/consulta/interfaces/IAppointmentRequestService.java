package br.edu.fatecpg.usafa.features.consulta.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.edu.fatecpg.usafa.features.consulta.dtos.Admin.AppointmentAdminResponseDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.Allow.AppointmentOperationDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.User.AppointmentUserResponseDTO;



public interface IAppointmentRequestService {

    // --- LEITURA ---
    
    /**
     * [ADMIN] Busca solicitações com visão completa (IDs, Status, Filtros).
     */
    Page<AppointmentAdminResponseDTO> getAllRequestsAdmin(String status, Pageable pageable);

    /**
     * [USER] Busca as solicitações do próprio paciente (Visão simplificada).
     */
    Page<AppointmentUserResponseDTO> getRequestsByUser(String userPublicId, Pageable pageable);

    // --- ESCRITA ---

    /**
     * [ADMIN] Atualiza status (Aceitar/Recusar). 
     * Usa AppointmentOperationDTO pois ele contém o campo 'status'.
     */
    AppointmentAdminResponseDTO updateStatus(String idStr, AppointmentOperationDTO dto);

    void deleteRequest(String idStr);
}
