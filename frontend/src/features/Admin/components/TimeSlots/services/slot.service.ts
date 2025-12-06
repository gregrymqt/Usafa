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
   */
  atualizarSlot: async (idSlot: number, data: Partial<Slot>): Promise<void> => {
    // CORREÇÃO DE COESÃO:
    // O Backend (AtualizarSlotDTO) espera 'novoStatus', mas a interface Slot tem 'status'.
    // Precisamos mapear manualmente para garantir que o Java entenda.
    
    const payload = {
      novoStatus: data.status, // Mapeia 'status' do front para 'novoStatus' do DTO Java
      // Se o DTO Java evoluir para aceitar valor, adicione aqui: valor: data.valor
    };

    await api.put<void>(`${ENDPOINT}/${idSlot}`, payload);
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
   */
  listarSlotsPorMedico: async (medicoId: string, dataIso: string): Promise<SlotResponse[]> => {
      // O backend não aceita filtro de data ainda, mas vamos mandar caso você implemente depois.
      // O importante aqui é que o ID agora faz parte da URL (/medico/${medicoId})
      
      const params = new URLSearchParams({
        data: dataIso 
      });

      // CORREÇÃO AQUI: Adicionado "/medico/" e o ID na rota
      return api.get<SlotResponse[]>(`${ENDPOINT}/medico/${medicoId}?${params.toString()}`);
  }
};