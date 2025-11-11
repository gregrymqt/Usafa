import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary
} from '../types/consulta.types.ts';
// Importa o seu cliente 'api' global
import api from '../../../shared/services/api.ts'; // (Ajuste o caminho se necessário)

/**
 * Busca a lista de consultas existentes do usuário (para a Tabela)
 * Agora faz uma chamada de API real.
 */
export const getConsultas = async (userId: string): Promise<Consulta[]> => {
  try {
    // Eu assumi que o endpoint para buscar consultas por usuário seja este:
    // GET /consultas/user/{userId}
    const consultas = await api.get<Consulta[]>(`/consultas/user/${userId}`);
    return consultas;
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    // Re-lança o erro para o hook 'useConsulta' poder capturá-lo
    throw new Error('Não foi possível carregar seu histórico de consultas.');
  }
};

/**
 * Busca as opções para preencher os <select> do formulário
 * Agora faz uma chamada de API real.
 */
export const getFormOptions = async (): Promise<ConsultaFormOptions> => {
  try {
    // Eu assumi que o endpoint para buscar as opções do formulário seja este:
    // GET /consultas/options
    const options = await api.get<ConsultaFormOptions>('/consultas/options');
    return options;
  } catch (error) {
    console.error('Erro ao buscar opções do formulário:', error);
    throw new Error('Não foi possível carregar as opções de agendamento.');
  }
};

/**
 * Envia a requisição de uma nova consulta (do Formulário)
 * Agora faz uma chamada de API real.
 */
export const requestConsulta = async (request: ConsultaRequest): Promise<ConsultaSummary> => {
  try {
    // Eu assumi que o endpoint para criar uma nova consulta seja este:
    // POST /consultas
    const summary = await api.post<ConsultaSummary>('/consultas', request);
    return summary;
  } catch (error) {
    console.error('Erro ao enviar requisição de consulta:', error);
    throw new Error('Não foi possível enviar sua solicitação de consulta.');
  }
};