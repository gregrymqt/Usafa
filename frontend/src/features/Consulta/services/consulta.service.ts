import {
  FormSelectOption,
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type GetConsultasParams,
 } from '../types/consulta.types.ts';
// Importa o seu cliente 'api' global
import api from '../../../shared/services/api.service.ts'; // (Ajuste o caminho se necessário)
import type { Page } from '../../../shared/utils/forPages.utils.ts';

/**
 * Busca a lista de consultas existentes do usuário (para a Tabela)
 * Agora faz uma chamada de API real.
 */
export const getConsultas = async (userId: string, params: GetConsultasParams): Promise<Page<Consulta>> => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
    });

    if (params.search) {
      queryParams.append('search', params.search);
    }
    const consultas = await api.get<Page<Consulta>>(`/consultas/user/${userId}?${queryParams.toString()}`);
    return consultas;
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
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
export const requestConsulta = async (request: ConsultaRequest): Promise<void> => {
  try {
    // A API agora retorna 202 Accepted com uma string simples,
    // não mais um objeto JSON ConsultaSummary.
    // Apenas esperamos a requisição completar, sem esperar um tipo de retorno.
    await api.post('/consultas', request);
  } catch (error) {
    console.error('Erro ao enviar requisição de consulta:', error);
    throw new Error('Não foi possível enviar sua solicitação de consulta.');
  }
};

/**
 * NOVA FUNÇÃO: Busca horários disponíveis apenas para um tipo de consulta específico
 */
export const getHorariosPorTipo = async (tipoConsultaId: string): Promise<FormSelectOption[]> => {
  try {
    // Bate no endpoint novo que criamos no Java
    const data = await api.get<FormSelectOption[]>(`/consultas/horarios-disponiveis/${tipoConsultaId}`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    // Retorna lista vazia em caso de erro para não quebrar o front
    return [];
  }
};