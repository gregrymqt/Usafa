import { useState, useCallback } from 'react';

import { showErrorToast, showSuccessToast } from '../../../utils/adminUtils';
import { ApiError } from '../../../../../shared';
import { patientPasswordService } from '../services/patientPassword.service';
import { PasswordTokenResponse } from '../types/patientPassword.type';

/**
 * Hook customizado para gerenciar as operações relacionadas aos tokens de criação de senha de pacientes.
 */
export const usePatientPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenData, setTokenData] = useState<PasswordTokenResponse | null>(null);

  /**
   * Gera um novo link de criação de senha para um usuário.
   * @param userPublicId - O ID público do paciente.
   */
  const generatePasswordToken = useCallback(async (userPublicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientPasswordService.generateToken({ userPublicId });
      setTokenData(response);
      showSuccessToast('Link de criação de senha gerado com sucesso!');
      // Retorna a resposta para que possa ser usada imediatamente (ex: copiar para a área de transferência)
      return response;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
      setError(message);
      showErrorToast(`Falha ao gerar link: ${message}`);
      throw err; // Propaga o erro para o componente, se necessário
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Busca os detalhes de um token de senha existente.
   * @param userPublicId - O ID público do paciente.
   */
  const getPasswordToken = useCallback(async (userPublicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientPasswordService.getToken(userPublicId);
      setTokenData(response);
      return response;
    } catch (err) {
      // Em caso de 404, o `api.service` já lança um ApiError.
      const message = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
      setError(message);
      setTokenData(null); // Limpa dados antigos se a busca falhar
      // Não mostra toast para busca, para não poluir a UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deleta/invalida um token de senha existente.
   * @param userPublicId - O ID público do paciente.
   */
  const deletePasswordToken = useCallback(async (userPublicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await patientPasswordService.deleteToken(userPublicId);
      setTokenData(null); // Limpa o estado local
      showSuccessToast('Token de senha invalidado com sucesso.');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado.';
      setError(message);
      showErrorToast(`Falha ao invalidar token: ${message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    tokenData,
    generatePasswordToken,
    getPasswordToken,
    deletePasswordToken,
  };
};