import  { api } from "../../../../../shared";
import type { Page } from "../../../../../shared/utils/forPages.utils";
import type { ConsultaUpdateData } from "../components/ConsultaRequest/Modal/types/ConsultaEditModal.type";
import type { ConsultaDocument} from "../components/ConsultaRequest/Table/types/consultaRequestTable.type";

// O endpoint base do seu controller Java
const API_URL = '/admin/requisicao/appointments';

interface GetRequestsParams {
  page: number;
  size: number;
  search: string;
  status: string;
}

/**
 * Busca as solicitações de consulta com suporte para paginação e busca.
 */
const getRequests = async (params: GetRequestsParams): Promise<Page<ConsultaDocument>> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  });

  if (params.search) {
    queryParams.append('search', params.search);
  }

  // Adiciona o filtro de status se ele existir
  if (params.status) {
    queryParams.append('status', params.status);
  }
  const data = await api.get<Page<ConsultaDocument>>(`${API_URL}?${queryParams.toString()}`);
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
  getRequests,
  updateStatus,
  deleteRequest,
};