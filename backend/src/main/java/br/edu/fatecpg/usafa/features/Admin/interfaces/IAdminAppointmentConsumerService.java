package br.edu.fatecpg.usafa.features.Admin.interfaces;

import br.edu.fatecpg.usafa.document.ConsultaDocument; // Importa o Documento do MongoDB [cite: 13]
import java.util.List;

/**
 * Interface de serviço para o Admin gerenciar as solicitações de consulta
 * (documentos) salvas no MongoDB.
 */
public interface IAdminAppointmentConsumerService {

    /**
     * (Admin) Busca todas as solicitações de consulta do MongoDB.
     * @return Lista de documentos de consulta, ordenados [cite: 2]
     */
    List<ConsultaDocument> getAllConsultaRequests();

    /**
     * (Admin) Atualiza o status de uma solicitação de consulta.
     *
     * @param consultaId O ID do documento no MongoDB.
     * @param newStatus O novo status (ex: "ACEITA" ou "RECUSADA") [cite: 6]
     * @return O documento atualizado [cite: 7]
     */
    ConsultaDocument updateConsultaStatus(String consultaId, String newStatus);
}
