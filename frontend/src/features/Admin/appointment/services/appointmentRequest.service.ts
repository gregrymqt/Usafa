import  { api } from "../../../../shared";
import type { ConsultaUpdateData } from "../components/ConsultaRequest/Modal/types/ConsultaEditModal.type";
import type { ConsultaDocument} from "../components/ConsultaRequest/Table/types/consultaRequestTable.type";

// O endpoint base do seu controller Java
const API_URL = '/admin/requisicao/appointments';

/**
 * Busca todas as solicitações de consulta.
 * Mapeia o endpoint GET / [cite: 14]
 */
const getAllRequests = async (): Promise<ConsultaDocument[]> => {
  const data = await api.get<ConsultaDocument[]>(API_URL);
  return data;
};

/**
 * Atualiza o status de uma consulta específica.
 * Mapeia o endpoint PATCH /{id}/status 
 */
const updateStatus = async (id: string, updateData: ConsultaUpdateData): Promise<ConsultaDocument> => {

  // Chama o endpoint de patch com o DTO 
  const data = await api.patch<ConsultaDocument>(`${API_URL}/${id}/status`, updateData);
  return data;
};

/**
 * Deleta uma solicitação de consulta.
 */
const deleteRequest = async (id: string): Promise<void> => {
  console.warn(`[consultaService] A função deleteRequest foi chamada para o ID: ${id}. 
    Você precisa implementar o endpoint @DeleteMapping no AdminAppointmentConsumerController.`);
  
  // Quando você criar o endpoint no backend, descomente a linha abaixo:
  // await api.delete(`${API_URL}/${id}`);

  // Simula uma resposta bem-sucedida por enquanto
  return Promise.resolve();
};


// Exporta todas as funções do serviço
export const consultaService = {
  getAllRequests,
  updateStatus,
  deleteRequest,
};