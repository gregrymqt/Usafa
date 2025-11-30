// services/profile.service.ts
import { api } from '../../../shared/services/api.service';
import { UserProfileUpdateDTO, type UserData } from '../types/profile.type';

// A função 'getAuthenticatedUserData' FOI REMOVIDA. Não é mais necessária.

/**
 * Atualiza os dados do usuário.
 * Retorna os dados novos confirmados pelo backend.
 */
export const updateUserData = async (data: UserProfileUpdateDTO): Promise<UserData> => {
  const formData = new FormData();

  // 1. Parte JSON ("profile")
  // O Backend espera um @RequestPart("profile") que seja JSON
  const profileData = {
    name: data.name,
    cep: data.cep
  };
  
  // Convertemos o objeto para string JSON e criamos um Blob com type application/json
  // Isso garante que o Spring Boot entenda que é a parte do DTO
  const jsonBlob = new Blob([JSON.stringify(profileData)], { type: 'application/json' });
  formData.append('profile', jsonBlob);

  // 2. Parte Arquivo ("file")
  if (data.imageFile) {
    formData.append('file', data.imageFile);
  }

  try {
    // Importante: Usar PUT (conforme sua Controller) e enviar o formData
    // Se você tiver o método 'putFormData' que criamos antes, use-o. 
    // Caso contrário, use api.put direto:
    const response = await api.put<UserData>('/api/v1/profile/me', formData, {
      headers: {
        // Removemos o Content-Type para o browser definir o boundary automaticamente
        'Content-Type': 'multipart/form-data'
      }
    });
    return response; // Axios retorna em .data
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw new Error('Não foi possível salvar as alterações.');
  }
};