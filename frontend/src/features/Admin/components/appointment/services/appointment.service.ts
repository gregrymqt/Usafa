import { api } from "../../../../../shared"; // Ajuste seu import
import type { 
  Page, 
  AppointmentAdminResponse, 
  AppointmentOperation, 
  ConsultaFormOptionsResponse, 
  FormSelectOption 
} from "../types/appointment.type";

const BASE_URL = '/consultas';

export const appointmentService = {

  // --- LEITURA ---

  /**
   * [ADMIN] Busca TODAS as consultas do sistema.
   * O Controller Java precisa ter um endpoint GET /consultas (sem /user) implementado.
   */
  getAllAppointments: async (params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });

    if (params.search) queryParams.append('search', params.search);

    // Agora retorna o tipo correto AppointmentAdminResponse
    const response = await api.get<Page<AppointmentAdminResponse>>(`${BASE_URL}?${queryParams.toString()}`);
    return response;
  },

  // --- ESCRITA (ADMIN) ---

  /**
   * [ADMIN] Cria um agendamento direto.
   * Payload: AppointmentOperationDTO
   */
  createAppointment: async (data: AppointmentOperation): Promise<void> => {
    await api.post(BASE_URL, data);
  },

  /**
   * [ADMIN] Edita um agendamento existente.
   * Payload: AppointmentOperationDTO
   */
  updateAppointment: async (id: string, data: AppointmentOperation): Promise<void> => {
    await api.put(`${BASE_URL}/${id}`, data);
  },

  /**
   * [ADMIN] Deleta um agendamento.
   */
  deleteAppointment: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // --- AUXILIARES (OPTIONS) ---

  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const response = await api.get<ConsultaFormOptionsResponse>(`${BASE_URL}/options`);
    return response;
  },

  getHorariosPorTipo: async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
    if (!tipoConsultaId) return [];
    const response = await api.get<FormSelectOption[]>(`${BASE_URL}/horarios-disponiveis/${tipoConsultaId}`);
    return response;
  }
};