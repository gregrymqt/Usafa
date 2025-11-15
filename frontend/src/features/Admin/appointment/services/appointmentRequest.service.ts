import  { api } from "../../../../shared";
import type { ConsultaDocument, IUpdateStatusDTO } from "../components/ConsultaRequestTable/types/consultaRequestTable.type";

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
const updateStatus = async (id: string, newStatus: string): Promise<ConsultaDocument> => {
  const dto: IUpdateStatusDTO = { status: newStatus };
  
  // Chama o endpoint de patch com o DTO 
  const data = await api.patch<ConsultaDocument>(`${API_URL}/${id}/status`, dto);
  return data;
};

/**
 * Deleta uma solicitação de consulta.
 *
 * ATENÇÃO: Seu ActionMenu [cite: 9] e props [cite: 22] precisam dessa função, 
 * mas seu Controller Java não forneceu um endpoint DELETE.
 *
 * Você precisará adicionar um @DeleteMapping("/{id}") no seu controller.
 * Por enquanto, esta função simulará a chamada.
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