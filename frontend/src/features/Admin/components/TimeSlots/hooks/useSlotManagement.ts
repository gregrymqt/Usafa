import { useState, useCallback } from 'react';
import { slotService } from '../services/slot.service';
import type { GerarAgendaData, AtualizarSlotData } from '../types/slot.types';
import { ApiError } from '../../../../../shared/exceptions/ApiError';

interface UseSlotManagementReturn {
  isLoading: boolean;
  error: string | null;
  generateAgenda: (data: GerarAgendaData) => Promise<boolean>;
  editSlot: (idSlot: number, data: AtualizarSlotData) => Promise<boolean>;
  removeSlot: (idSlot: number) => Promise<boolean>;
  clearError: () => void;
}

export const useSlotManagement = (): UseSlotManagementReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para tratar erros usando sua classe ApiError
  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      // Se for o nosso erro tratado, pega a mensagem do Backend (ex: "Data inválida")
      setError(err.message);
    } else if (err instanceof Error) {
      // Erro genérico de JS/Rede
      setError(err.message);
    } else {
      setError('Ocorreu um erro inesperado ao processar a solicitação.');
    }
    setIsLoading(false);
  };

  const clearError = useCallback(() => setError(null), []);

  /**
   * 1. Gerar Agenda em Lote
   */
  const generateAgenda = useCallback(async (data: GerarAgendaData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await slotService.gerarAgenda(data);
      setIsLoading(false);
      return true; // Sucesso
    } catch (err) {
      handleError(err);
      return false; // Falha
    }
  }, []);

  /**
   * 2. Editar Slot (Bloquear ou mudar valor)
   */
  const editSlot = useCallback(async (idSlot: number, data: AtualizarSlotData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await slotService.atualizarSlot(idSlot, data);
      setIsLoading(false);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, []);

  /**
   * 3. Deletar Slot
   */
  const removeSlot = useCallback(async (idSlot: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await slotService.deleteSlot(idSlot);
      setIsLoading(false);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  }, []);

  return {
    isLoading,
    error,
    generateAgenda,
    editSlot,
    removeSlot,
    clearError
  };
};