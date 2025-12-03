import { api } from "../../../../../shared"; // Ajuste seu import conforme projeto
import { 
  Appointment, 
  AppointmentFormData, 
  ConsultaFormOptionsResponse, 
  FormSelectOption,
  Page // Importe a nova interface
} from "../types/appointment.type";

const ENDPOINT_BASE = '/consultas';
const ENDPOINT_ADMIN = '/admin/appointments'; 

export const appointmentService = {

  // --- CORREÇÃO 1: Adicionando o método que faltava ---
  getAppointments: async (params: { page: number; size: number; search: string }): Promise<Page<Appointment>> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    // Garante que o parâmetro de busca seja enviado apenas se não for uma string vazia.
    if (params.search && params.search.trim() !== '') {
      queryParams.append('search', params.search);
    }

    const data = await api.get<Page<Appointment>>(`${ENDPOINT_ADMIN}?${queryParams.toString()}`);
    return data; // Assumindo que api.get retorna o corpo da resposta diretamente
  },

  // ... (getFormOptions e getSlotsByType mantêm-se iguais) ...
  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const  data  = await api.get<ConsultaFormOptionsResponse>(`${ENDPOINT_BASE}/options`);
    return data;
  },

  getSlotsByType: async (tipoId: string): Promise<FormSelectOption[]> => {
    if (!tipoId) return [];
    const  data  = await api.get<FormSelectOption[]>(`${ENDPOINT_BASE}/horarios-disponiveis/${tipoId}`);
    return data;
  },

  // --- CORREÇÃO 2: Tipagem explícita para resolver o erro do 'unknown' no Hook ---
  
  createAppointment: async (appointmentData: AppointmentFormData): Promise<Appointment> => {
    // Tipamos o .post<Appointment> para o TS saber que volta um Agendamento completo
    const  data = await api.post<Appointment>(ENDPOINT_ADMIN, appointmentData);
    return data;
  },

  updateAppointment: async (id: string | number, appointmentData: AppointmentFormData): Promise<Appointment> => {
    const  data  = await api.put<Appointment>(`${ENDPOINT_ADMIN}/${id}`, appointmentData);
    return data;
  },
  
  deleteAppointment: async (id: string | number): Promise<void> => {
    // Apenas executamos a chamada. O wrapper da 'api' pode tentar dar um .json()
    // em uma resposta vazia (204 No Content), causando o erro.
    // Ao não usar 'await' no retorno de api.delete, evitamos esse processamento.
    api.delete(`${ENDPOINT_ADMIN}/${id}`);
  }
};

export { Appointment };
