import { api } from "../../../../../shared";
import { UpdateUserAndCreatePasswordData, ValidateTokenResponse } from "../types/createPassword.type";

export const passwordTokenService = {

  /**
   * Valida o token de criação de senha (UUID) e retorna os dados do usuário.
   * Rota Backend: GET /admin/password-tokens/validate/{tokenId}
   */
  validateTokenAndGetUser: async (tokenId: string): Promise<ValidateTokenResponse> => {
    // Monta a URL combinando o RequestMapping da classe e do método [cite: 1, 16]
    const endpoint = `/admin/password-tokens/validate/${tokenId}`;
    
    // Usa o método api.get configurado no seu arquivo api.ts 
    return await api.get<ValidateTokenResponse>(endpoint);
  },

  /**
   * (Opcional) Se precisar reenviar/gerar token manualmente pelo admin
   * Rota Backend: POST /admin/password-tokens/generate [cite: 6]
   */
  generateToken: async (userPublicId: string): Promise<void> => {
      // O endpoint espera um DTO com { userPublicId: string }
      await api.post('/admin/password-tokens/generate', { userPublicId });
  },

  createPassword: async (data : UpdateUserAndCreatePasswordData): Promise<void> => {
  return api.post<void>(`/admin/password-tokens/complete-creation`, data);
},
};