import { api } from "../../../../../shared";
import { SolicitacaoSummary, ConsultaRequest } from "../../../../Consulta/types/consulta.types";
import { ConsultaUpdateData } from "../components/ConsultaRequest/Modal/types/ConsultaEditModal.type";
import { Page } from "../types/appointment.type";


// Rota base alinhada com AppointmentRequestController
const BASE_URL = '/requests';

export const appointmentRequestService = {

  // --- LEITURA (UNIFICADA) ---

  /**
   * Busca solicitações.
   * - Se for PACIENTE: Passa apenas o userId.
   * - Se for ADMIN: Pode passar userId (filtro), status e search.
   * * Rota: GET /requests?userId=...&status=...
   */
  getRequests: async (params: { 
    page: number; 
    size: number; 
    userId?: string; 
    status?: string; 
    search?: string; 
  }) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.userId) queryParams.append('userId', params.userId);
    if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await api.get<Page<SolicitacaoSummary>>(`${BASE_URL}?${queryParams.toString()}`);
    return response;
  },

  // --- ESCRITA (PUBLIC) ---

  /**
   * [PUBLIC] Envia uma nova solicitação para a fila.
   */
  createRequest: async (payload: ConsultaRequest): Promise<void> => {
    await api.post(BASE_URL, payload);
  },

  // --- ESCRITA (ADMIN) ---

  /**
   * [ADMIN] Atualiza o status (ACEITA/RECUSA) ou re-agenda.
   * Rota: PUT /requests/{id}/status
   */
  updateStatus: async (id: string, updateData: ConsultaUpdateData): Promise<void> => {
    await api.put(`${BASE_URL}/${id}/status`, updateData);
  },

  /**
   * [ADMIN] Deleta uma solicitação.
   */
  deleteRequest: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  }
};