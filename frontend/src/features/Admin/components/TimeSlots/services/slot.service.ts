import api from '../../../../../shared/services/api.service';
// Importamos SlotResponse para garantir que o retorno da API seja conhecido
import type { GerarAgendaData, Slot, SlotResponse } from '../types/slot.types';

const ENDPOINT = '/admin/slots';

export const slotService = {

  /**
   * Gera múltiplos slots de uma vez (Lote).
   * Rota: POST /admin/slots/gerar
   */
  gerarAgenda: async (data: GerarAgendaData): Promise<void> => {
    await api.post<void>(`${ENDPOINT}/gerar`, data);
  },

  /**
   * Atualiza um slot individual (Bloquear ou Mudar Preço).
   * Rota: PUT /admin/slots/{id}
   * Usamos Partial<Slot> pois podemos enviar apenas o status ou apenas o valor.
   */
  atualizarSlot: async (idSlot: number, data: Partial<Slot>): Promise<void> => {
    await api.put<void>(`${ENDPOINT}/${idSlot}`, data);
  },

  /**
   * Exclui um slot (Somente se estiver DISPONIVEL ou BLOQUEADO).
   * Rota: DELETE /admin/slots/{id}
   */
  deleteSlot: async (idSlot: number): Promise<void> => {
    await api.delete<void>(`${ENDPOINT}/${idSlot}`);
  },
  
  /**
   * Busca slots de um médico para exibir na tabela.
   * Rota: GET /admin/slots?medicoId=...&data=...
   * * MUDANÇA: Retorna Promise<SlotResponse[]> em vez de any[]
   */
  listarSlotsPorMedico: async (medicoId: string, dataIso: string): Promise<SlotResponse[]> => {
      const params = new URLSearchParams({
        medicoId: medicoId,
        data: dataIso
      });
      
      // Tipamos o retorno do get para SlotResponse[]
      return api.get<SlotResponse[]>(`${ENDPOINT}?${params.toString()}`);
  }
};