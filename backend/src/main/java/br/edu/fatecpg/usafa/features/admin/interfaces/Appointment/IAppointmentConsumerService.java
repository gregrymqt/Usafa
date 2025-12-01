package br.edu.fatecpg.usafa.features.admin.interfaces.Appointment;

import br.edu.fatecpg.usafa.document.RequestAppointment; // Importa o Documento do MongoDB [cite: 13]
import br.edu.fatecpg.usafa.features.admin.dtos.appointment.UpdateAppointmentDTO;
import br.edu.fatecpg.usafa.features.consulta.dtos.RequestAppointmentResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


/**
 * Interface de serviço para o Admin gerenciar as solicitações de consulta
 * (documentos) salvas no MongoDB.
 */
public interface IAppointmentConsumerService {

    /**
     * (Admin) Busca todas as solicitações de consulta do MongoDB.
     */
    Page<RequestAppointmentResponseDto> getAllConsultaRequests(String search, String status, Pageable pageable);

    /**
     * (Admin) Atualiza uma solicitação de consulta (dia, hora, status).
     * Se o status for "ACEITA", move a consulta para o banco SQL.
     *
     * @param consultaId O ID do documento no MongoDB.
     * @param dto Os dados da atualização.
     * @return O documento atualizado (ou o documento como estava antes de ser movido para o SQL).
     */
     RequestAppointmentResponseDto updateConsultaStatus(String consultaId, UpdateAppointmentDTO dto); // Assinatura atualizada

    /**
     * (Admin) Deleta permanentemente uma solicitação de consulta do MongoDB.
     *
     * @param consultaId O ID do documento no MongoDB.
     */
    void deleteConsultaRequest(String consultaId); // Novo método
}
