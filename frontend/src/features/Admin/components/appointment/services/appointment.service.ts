import { api } from "../../../../../shared";
import { SolicitacaoSummary } from "../../../../Consulta/types/consulta.types";
import { Page, AppointmentFormData, ConsultaFormOptionsResponse, FormSelectOption } from "../types/appointment.type";

const BASE_URL = '/consultas';

export const appointmentService = {

  // --- LEITURA (PUBLIC & ADMIN) ---

  /**
   * [PUBLIC] Busca histórico de consultas de um usuário específico.
   * Rota: GET /consultas/user/{userId}
   */
  getMyAppointments: async (userId: string, params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });
    
    if (params.search) queryParams.append('search', params.search);
    
    // Retorna Page<ConsultaSummary>
    const response = await api.get<Page<SolicitacaoSummary>>(`${BASE_URL}/user/${userId}?${queryParams.toString()}`);
    return response; 
  },

  /**
   * [ADMIN] Busca TODAS as consultas do sistema.
   * Rota sugerida: GET /consultas (Admin Controller deve implementar isso)
   */
  getAllAppointments: async (params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });

    if (params.search) queryParams.append('search', params.search);

    const response = await api.get<Page<SolicitacaoSummary>>(`${BASE_URL}?${queryParams.toString()}`);
    return response;
  },

  // --- ESCRITA (ADMIN) ---

  /**
   * [ADMIN] Cria um agendamento direto (sem passar por solicitação).
   */
  createAppointment: async (data: AppointmentFormData): Promise<void> => {
    await api.post(BASE_URL, data);
  },

  /**
   * [ADMIN] Edita um agendamento existente.
   */
  updateAppointment: async (id: string, data: AppointmentFormData): Promise<void> => {
    await api.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * [ADMIN] Cancela/Deleta um agendamento.
   */
  deleteAppointment: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // --- DADOS AUXILIARES (COMPARTILHADO) ---

  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const data = await api.get<ConsultaFormOptionsResponse>(`${BASE_URL}/options`);
    return data;
  },

  getHorariosPorTipo: async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
    if (!tipoConsultaId) return [];
    const data = await api.get<FormSelectOption[]>(`${BASE_URL}/horarios-disponiveis/${tipoConsultaId}`);
    return data;
  }
};