import api from '../../../shared/services/api.service'; 
import { 
  ConsultaRequest, 
  ConsultaFormOptionsResponse, 
  FormSelectOption,
  SolicitacaoSummary, // Atenção: Verifique se os campos batem com o DTO do back
  Page
} from '../types/consulta.types';

// Rota para Consultas Confirmadas (AppointmentController)
const CONSULTAS_BASE_URL = '/consultas';

// Rota para Solicitações/Rascunhos (AppointmentRequestController)
const REQUESTS_BASE_URL = '/requests';

export const consultaService = {

  // --- 1. CONSULTAS CONFIRMADAS (AppointmentController) ---

  /**
   * Busca histórico de consultas confirmadas.
   * Rota Back: GET /consultas/user/{userId}
   */
  getConsultasConfirmadas: async (userId: string, params: { page: number, size: number, search?: string }) => {
    const queryParams = new URLSearchParams({
        page: params.page.toString(),
        size: params.size.toString()
    });
    
    if (params.search) queryParams.append('search', params.search);
    
    const response = await api.get<Page<SolicitacaoSummary>>(`${CONSULTAS_BASE_URL}/user/${userId}?${queryParams.toString()}`);
    return response; 
  },

  // --- 2. SOLICITAÇÕES / REQUESTS (AppointmentRequestController) ---

  /**
   * Busca solicitações pendentes (ou histórico de solicitações).
   * Rota Back: GET /requests?userId={userId}&status={status}&page=...
   * CORREÇÃO: Agora bate com a nova controller.
   */
  getSolicitacoesPendentes: async (userId: string, page: number) => {
    const queryParams = new URLSearchParams({
      userId: userId, // Passa como Query Param
      page: page.toString(),
      size: '10',
      // status: 'PENDENTE' // Se quiser filtrar só pendentes, descomente aqui
    });

    // Chama /requests em vez de /consultas/requests/...
    const data = await api.get<Page<SolicitacaoSummary>>(`${REQUESTS_BASE_URL}?${queryParams.toString()}`);
    return data;
  },

  /**
   * Envia uma nova solicitação.
   * Rota Back: POST /requests
   * CORREÇÃO: URL ajustada.
   */
  requestConsulta: async (payload: ConsultaRequest): Promise<void> => {
    await api.post(REQUESTS_BASE_URL, payload);
  },

  // --- 3. DADOS AUXILIARES (AppointmentController) ---
  // Estes continuam em /consultas pois são dados de apoio

  getFormOptions: async (): Promise<ConsultaFormOptionsResponse> => {
    const data = await api.get<ConsultaFormOptionsResponse>(`${CONSULTAS_BASE_URL}/options`);
    return data;
  },

  getHorariosPorTipo: async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
    if (!tipoConsultaId) return [];
    const data = await api.get<FormSelectOption[]>(`${CONSULTAS_BASE_URL}/horarios-disponiveis/${tipoConsultaId}`);
    return data;
  }
};