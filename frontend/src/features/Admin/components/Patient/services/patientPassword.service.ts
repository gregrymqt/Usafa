import api from "../../../../../shared/services/api.service";
import { GeneratePasswordTokenRequest, PasswordTokenResponse } from "../types/patientPassword.type";

/**
 * O endpoint base para as operações relacionadas aos tokens de criação de senha.
 */
const BASE_URL = '/admin/password-tokens';

/**
 * Gera um novo token de criação de senha para um paciente.
 * @param data - O objeto contendo o `userPublicId` do paciente.
 * @returns Uma promessa que resolve com os detalhes do token gerado.
 */
const generateToken = (data: GeneratePasswordTokenRequest): Promise<PasswordTokenResponse> => {
  return api.post<PasswordTokenResponse>(`${BASE_URL}/generate`, data);
};

/**
 * Busca um token de criação de senha existente pelo ID público do usuário.
 * @param userPublicId - O ID público do usuário.
 * @returns Uma promessa que resolve com os detalhes do token, se encontrado.
 */
const getToken = (userPublicId: string): Promise<PasswordTokenResponse> => {
  return api.get<PasswordTokenResponse>(`${BASE_URL}/${userPublicId}`);
};

/**
 * Deleta um token de criação de senha, invalidando o link.
 * @param userPublicId - O ID público do usuário cujo token será deletado.
 * @returns Uma promessa vazia que resolve quando a operação é concluída.
 */
const deleteToken = (userPublicId: string): Promise<void> => {
  return api.delete<void>(`${BASE_URL}/${userPublicId}`);
};

export const patientPasswordService = {
  generateToken,
  getToken,
  deleteToken,
};