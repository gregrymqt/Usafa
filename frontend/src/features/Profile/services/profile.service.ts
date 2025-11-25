// services/profile.service.ts
import { api } from '../../../shared/services/api.service';
import { type UserData } from '../types/profile.type';

// A função 'getAuthenticatedUserData' FOI REMOVIDA. Não é mais necessária.

/**
 * Atualiza os dados do usuário.
 * Retorna os dados novos confirmados pelo backend.
 */
export const updateUserData = async (data: Partial<UserData>): Promise<UserData> => {
  try {
    const updatedUser = await api.patch<UserData>('/api/v1/profile/me', data);
    return updatedUser;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw new Error('Não foi possível salvar as alterações.');
  }
};