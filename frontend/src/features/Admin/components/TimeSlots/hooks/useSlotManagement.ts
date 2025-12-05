import { useState, useCallback } from "react";
import { slotService } from "../services/slot.service";
import type {
  GerarAgendaData,
  Slot,
  SlotResponse,
  SlotStatus,
} from "../types/slot.types";
import { ApiError } from "../../../../../shared/exceptions/ApiError";

interface UseSlotManagementReturn {
  isLoading: boolean;
  slots: Slot[];
  fetchSlots: (medicoId: string) => Promise<void>;
  error: string | null;
  generateAgenda: (data: GerarAgendaData) => Promise<boolean>;
  editSlot: (idSlot: number, data: Partial<Slot>) => Promise<boolean>;
  removeSlot: (idSlot: number) => Promise<boolean>;
  clearError: () => void;
}

export const useSlotManagement = (): UseSlotManagementReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);

  const fetchSlots = useCallback(async (medicoId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Chama o service (que deve chamar o endpoint GET que criamos no back)
      const data: SlotResponse[] = await slotService.listarSlotsPorMedico(
        medicoId,
        new Date().toISOString()
      );

      // Adapter: Converter SlotResponse (API) para Slot (Front)
      const slotsFormatados: Slot[] = data.map((s) => ({
        id: s.id,
        medicoId: s.medicoId || medicoId,
        dataHoraInicio: s.dataHoraInicio,
        dataHoraFim: s.dataHoraFim,
        status: s.status as SlotStatus, // Cast para o tipo SlotStatus
        valor: s.valor,
      }));

      setSlots(slotsFormatados);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper para tratar erros usando sua classe ApiError
  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      // Se for o nosso erro tratado, pega a mensagem do Backend (ex: "Data inválida")
      setError(err.message);
    } else if (err instanceof Error) {
      // Erro genérico de JS/Rede
      setError(err.message);
    } else {
      setError("Ocorreu um erro inesperado ao processar a solicitação.");
    }
    setIsLoading(false);
  };

  const clearError = useCallback(() => setError(null), []);

  /**
   * 1. Gerar Agenda em Lote
   */
  const generateAgenda = useCallback(
    async (data: GerarAgendaData): Promise<boolean> => {
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
    },
    []
  );

  /**
   * 2. Editar Slot (Bloquear ou mudar valor)
   */
  const editSlot = useCallback(
    async (idSlot: number, data: Partial<Slot>): Promise<boolean> => {
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
    },
    []
  );

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
    slots, // Exporta os slots
    fetchSlots, // Exporta a função de busca
    generateAgenda,
    editSlot,
    removeSlot,
    clearError,
  };
};
