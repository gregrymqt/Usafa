import api from '../../../shared/services/api.service'; 
import { 
  ConsultaRequest, 
  ConsultaFormOptionsResponse, 
  FormSelectOption,
  AppointmentUserResponse, // Interface corrigida
  Page
} from '../types/consulta.types';

// Rota para Consultas Confirmadas
const CONSULTAS_BASE_URL = '/consultas';

// Rota para Solicitações (Requests)
const REQUESTS_BASE_URL = '/requests';

export const consultaService = {

  // --- 1. CONSULTAS CONFIRMADAS (AppointmentController) ---
  // Retorna Page<AppointmentUserResponseDTO> do Java
  getConsultasConfirmadas: async (userId: string, params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });
    
    if (params.search) queryParams.append('search', params.search);
    
    // O backend retorna AppointmentUserResponseDTO
    const response = await api.get<Page<AppointmentUserResponse>>(`${CONSULTAS_BASE_URL}/user/${userId}?${queryParams.toString()}`);
    return response; // Geralmente axios retorna .data, verifique seu api.service
  },

  // --- 2. SOLICITAÇÕES / REQUESTS (AppointmentRequestController) ---
  // Retorna Page<AppointmentUserResponseDTO> quando é USER
  getSolicitacoesPendentes: async (page: number) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: '10'
    });

    const response = await api.get<Page<AppointmentUserResponse>>(`${REQUESTS_BASE_URL}?${queryParams.toString()}`);
    return response;
  },

  // Envia AppointmentOperationDTO
  requestConsulta: async (payload: ConsultaRequest): Promise<AppointmentUserResponse> => {
    // Agora esperamos um retorno com dados (data), não void
    const response = await api.post<AppointmentUserResponse>('/requests', payload);
    return response; 
},

  // --- 3. OPTIONS (AppointmentController - Allow) ---
  
  // Retorna FormOptionsDTO
  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const response = await api.get<ConsultaFormOptionsResponse>(`${CONSULTAS_BASE_URL}/options`);
    return response;
  },

  // Retorna List<SelectOptionDTO>
  getHorariosPorTipo: async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
    if (!tipoConsultaId) return [];
    const response = await api.get<FormSelectOption[]>(`${CONSULTAS_BASE_URL}/horarios-disponiveis/${tipoConsultaId}`);
    return response;
  }
};