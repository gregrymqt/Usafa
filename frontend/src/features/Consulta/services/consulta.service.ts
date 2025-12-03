import api from '../../../shared/services/api.service'; 
import { 
  ConsultaRequest, 
  ConsultaFormOptionsResponse, 
  FormSelectOption,
  ConsultaSummary,
  Page
} from '../types/consulta.types';

const BASE_URL = '/consultas';

export const consultaService = {

  // 1. Listagem
  // ... dentro do objeto consultaService

  getConsultasConfirmadas: async (userId: string, params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });
    
    if (params.search) queryParams.append('search', params.search);
    
    // O wrapper já retorna o corpo (Page<ConsultaSummary>), então atribuímos direto a 'response'
    const response = await api.get<Page<ConsultaSummary>>(`${BASE_URL}/user/${userId}?${queryParams.toString()}`);
    
    return response; // Retorna o objeto Page direto
  },

  getSolicitacoesPendentes: async (userId: string, page: number) => {
    const  data  = await api.get<Page<ConsultaSummary>>(`${BASE_URL}/requests/user/${userId}?page=${page}&size=10`);
    return data;
  },

  // 2. Auxiliares
  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const  data  = await api.get<ConsultaFormOptionsResponse>(`${BASE_URL}/options`);
    return data;
  },

  getHorariosPorTipo: async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
    if (!tipoConsultaId) return [];
    const  data  = await api.get<FormSelectOption[]>(`${BASE_URL}/horarios-disponiveis/${tipoConsultaId}`);
    return data;
  },

  // 3. Envio
  requestConsulta: async (payload: ConsultaRequest): Promise<void> => {
    await api.post(BASE_URL, payload);
  }
};