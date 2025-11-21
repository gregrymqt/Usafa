// hooks/useUserProfileData.ts (Modificado)

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../shared';
import { type UserData, type UserProfileUpdateDTO } from '../types/profile.type';
// Importe as duas funções da sua API
import { getAuthenticatedUserData, updateUserData } from '../services/profile.type'; 

/**
 * Hook customizado para gerenciar os dados do perfil do usuário autenticado.
 * Lida com o carregamento (GET) e a atualização (UPDATE) dos dados.
 */
export const useUserProfileData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados específicos para a operação de atualização
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Busca os dados do perfil do usuário autenticado na API.
   */
  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await getAuthenticatedUserData();
      setUserData(user);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Erro ao carregar dados do perfil.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para carregar os dados iniciais quando o hook é montado.
  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  /**
   * Envia os dados atualizados do perfil para a API.
   * @param updateData - Os dados do formulário a serem enviados.
   * @returns `true` em caso de sucesso, `false` em caso de falha.
   */
  const handleUpdateProfile = async (updateData: UserProfileUpdateDTO) => {
    setUpdateError(null);
    setIsUpdating(true);
    try {
      const updatedUser = await updateUserData(updateData);
      
      // Sucesso: Atualiza o estado local com os novos dados retornados pela API.
      // Isso garante que a UI reflita as informações mais recentes.
      setUserData(updatedUser); 
      
      return true; 
      
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Erro ao atualizar o perfil.';
      setUpdateError(errorMsg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { 
    userData, 
    isLoading, 
    error,
    // Propriedades e métodos para a atualização
    isUpdating,
    updateError,
    handleUpdateProfile,
    // Função para recarregar os dados manualmente, se necessário
    refetchProfile: loadProfileData,
  };
};