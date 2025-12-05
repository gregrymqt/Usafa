import { api } from "../../../../../shared"; // Ajuste seu import
import type { 
  Page, 
  AppointmentAdminResponse, // O Admin vê solicitações com dados completos
  AppointmentOperation        // O Admin usa isso para atualizar status
} from "../types/appointment.type";

const BASE_URL = '/requests';

export const appointmentRequestService = {

  // --- LEITURA ---

  /**
   * [ADMIN] Busca solicitações com filtros.
   * Retorna AppointmentAdminResponseDTO (pois o endpoint Java admin retorna o DTO completo)
   */
  getRequestsAdmin: async (params: { 
    page: number; 
    size: number; 
    status?: string; 
    search?: string; 
    userId?: string;
  }) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await api.get<Page<AppointmentAdminResponse>>(`${BASE_URL}?${queryParams.toString()}`);
    return response;
  },

  // --- ESCRITA ---

  /**
   * [ADMIN] Atualiza o status (ACEITA/RECUSA).
   * Java: PUT /requests/{id}/status -> Body: AppointmentOperationDTO
   */
  updateStatus: async (id: string, updateData: AppointmentOperation): Promise<void> => {
    // Atenção: O backend espera AppointmentOperationDTO no body
    await api.put(`${BASE_URL}/${id}/status`, updateData);
  },

  /**
   * [ADMIN] Deleta uma solicitação.
   */
  deleteRequest: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  }
};