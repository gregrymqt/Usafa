import { useState, useCallback } from 'react';

import Swal from 'sweetalert2';
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
      Swal.fire('Sucesso', 'Link de criação de senha gerado com sucesso!', 'success');
      // Retorna a resposta para que possa ser usada imediatamente (ex: copiar para a área de transferência)
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Ocorreu um erro inesperado ao gerar o link.';
      setError(errorMessage);
      Swal.fire('Falha ao Gerar Link', errorMessage, 'error');
      throw error; // Propaga o erro para o componente, se necessário
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
    } catch (error: unknown) {
      // Em caso de 404, o `api.service` já lança um ApiError.
      const errorMessage = error instanceof ApiError ? error.message : 'Ocorreu um erro inesperado.';
      setError(errorMessage);
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
      Swal.fire('Sucesso', 'Token de senha invalidado com sucesso.', 'success');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Ocorreu um erro inesperado ao invalidar o token.';
      setError(errorMessage);
      Swal.fire('Falha ao Invalidar', errorMessage, 'error');
      throw error;
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