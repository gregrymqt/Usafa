// hooks/useUserProfileData.ts (Modificado)

import { useState, useEffect, useCallback } from 'react';
import { type UserData } from '../types/index';
// Importe as duas funções da sua API
import { getAuthenticatedUserData, updateUserData } from '../services/api'; 

// O DTO que o backend espera (name, cep, picture)
// É uma boa prática ter esse tipo no seu 'types/index.ts'
export interface UserProfileUpdateDTO {
  name: string;
  cep: string;
  picture: string;
}

export const useUserProfileData = (userId: string) => {
  // Estados para o GET (leitura)
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NOVOS ESTADOS PARA O UPDATE ---
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  // ---

  // Lógica de GET (permanece a mesma)
  const loadProfileData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError("ID do usuário não fornecido.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const user = await getAuthenticatedUserData();
      setUserData(user);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao carregar dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // --- NOVO MÉTODO PARA O UPDATE ---
  const handleUpdateProfile = async (updateData: UserProfileUpdateDTO) => {
    setUpdateError(null);
    setIsUpdating(true);
    try {
      // 1. Chama a função da API que você já tem
      // (O DTO do frontend (parcial) é compatível com o DTO do backend (completo))
      const updatedUser = await updateUserData(updateData);
      
      // 2. SUCESSO! Atualiza o estado local com os novos dados.
      // Isso fará a página inteira (e o formulário) recarregar
      // com as novas informações, sem precisar de um refresh manual.
      setUserData(updatedUser); 
      
      // Opcional: retornar true para o componente saber que deu certo
      return true; 
      
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : 'Erro ao atualizar o perfil.';
      setUpdateError(errorMsg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  // ---

  return { 
    userData, 
    isLoading, 
    error,
    isUpdating,
    updateError,
    handleUpdateProfile 
  };
};