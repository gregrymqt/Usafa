import api from '../../../shared/services/api';
// Removido: import type { AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, UpdateUserData, UserSession } from '../types/auth.types';

/**
 * Envia as credenciais de login para o endpoint /auth/login (usando fetch).
 * @param credentials - Um objeto contendo email e senha. [cite: 24]
 * @returns Uma promessa que resolve para os dados da resposta de login. [cite: 25]
 */
export const login = (credentials: LoginCredentials): Promise<UserSession> => {
  // A chamada é idêntica [cite: 26]
  // Nosso wrapper fetch já retorna os dados (não 'response.data')
  return api.post<UserSession>('/auth/login', credentials);
};

/**
 * Envia os dados de cadastro para o endpoint /auth/create (usando fetch).
 * @param data - Um objeto contendo nome, email e senha. [cite: 30]
 * @returns Uma promessa que resolve para a resposta da API. [cite: 31]
 */
export const register = async (data: RegisterData): Promise<UserSession> => {
  // A chamada é idêntica e não retorna conteúdo [cite: 32]
  // Re-lançamos o erro (sem a tipagem do Axios) [cite: 34]
  return api.post<UserSession>('/auth/create', data);
};

/**
 * Busca um usuário com base no seu ID público (UUID).
 * 
 * @param publicId O ID público do usuário.
 * @return Uma promessa que resolve para os dados da resposta de buscar usuário.
 * @throws {Error} Se a API retornar com um erro.
 */
export const getUserByPublicId = async (publicId: string): Promise<UserSession> => {
  return api.get<UserSession>(`/auth/id/${publicId}`);
};


/**
 * Atualiza os dados do usuário com base no seu ID público (UUID).
 * 
 * @param publicId O ID público do usuário.
 * @param userData Os dados a serem atualizados.
 * @returns Uma promessa que resolve para os dados da resposta de atualizar usuário.
 * @throws {Error} Se a API retornar com um erro.
 */
export const updateUserByPublicId = async (publicId: string, userData: UpdateUserData): Promise<UserSession> => {
  return api.put<UserSession>(`/auth/id/${publicId}`, userData);
};