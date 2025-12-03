// services/profile.service.ts
import { api } from '../../../shared/services/api.service';
import { UserProfileUpdateDTO, type UserData } from '../types/profile.type';

export const updateUserData = async (data: UserProfileUpdateDTO): Promise<UserData> => {
  const formData = new FormData();

  // 1. Parte JSON ("profile")
  const profileData = {
    name: data.name,
    cep: data.cep
  };
  
  const jsonBlob = new Blob([JSON.stringify(profileData)], { type: 'application/json' });
  formData.append('profile', jsonBlob);

  // 2. Parte Arquivo ("file")
  if (data.imageFile) {
    formData.append('file', data.imageFile);
  }

  try {
    // --- CORREÇÃO AQUI ---
    // Use o método helper 'putFormData' que criamos no api.service.ts
    // Ele remove automaticamente o Content-Type para o browser setar o boundary
    return await api.putFormData<UserData>('/api/v1/profile/me', formData);


  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw new Error('Não foi possível salvar as alterações.');
  }
};