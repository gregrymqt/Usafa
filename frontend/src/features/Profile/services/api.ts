// services/userApi.ts

// 1. Importa o wrapper 'api' global
// (Estou assumindo que seu 'api.ts' global está em 'lib/api.ts' ou 'services/api.ts')
// Ajuste o caminho se necessário.
import { api } from '../../../shared/services/api'; // Ou '../lib/api'

// 2. Importa o tipo de dado que esperamos
import { type UserData } from '../types';

/**
 * Busca os dados do usuário autenticado na API.
 * A API saberá quem é o usuário pelo token JWT enviado pelo wrapper 'api'.
 */
export const getAuthenticatedUserData = async (): Promise<UserData> => {
  try {
    // 3. Usa o método 'get' do seu wrapper global
    // O 'api.get' já vai incluir o 'Authorization' header
    // O endpoint '/profile/me' ou '/users/me' é comum para isso.
    const userData = await api.get<UserData>('/api/v1/profile/me'); 
    return userData;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    // O 'api.get' já tratou o erro globalmente (ex: 401), 
    // mas podemos relançar para o hook/componente saber que falhou.
    throw new Error('Não foi possível carregar os dados do perfil.');
  }
};

/**
 * Atualiza os dados do usuário (ex: CEP ou endereço).
 * Recebe os dados parciais para enviar no 'body' da requisição.
 */
export const updateUserData = async (data: Partial<UserData>): Promise<UserData> => {
  try {
    // 4. Usa o método 'patch' ou 'put' do seu wrapper
    const updatedUser = await api.patch<UserData>('/api/v1/profile/me', data);
    return updatedUser;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw new Error('Não foi possível salvar as alterações.');
  }
};


