import api from '../../../../../shared/services/api.service';
import type { GerarAgendaData, AtualizarSlotData } from '../types/slot.types';

const ENDPOINT = '/admin/slots';

export const slotService = {

  /**
   * Gera múltiplos slots de uma vez (Lote).
   * Rota: POST /admin/slots/gerar
   */
  gerarAgenda: async (data: GerarAgendaData): Promise<void> => {
    // O api.post já stringifica o JSON e adiciona o token
    await api.post<void>(`${ENDPOINT}/gerar`, data);
  },

  /**
   * Atualiza um slot individual (Bloquear ou Mudar Preço).
   * Rota: PUT /admin/slots/{id}
   */
  atualizarSlot: async (idSlot: number, data: AtualizarSlotData): Promise<void> => {
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
   * (Opcional) Busca slots de um médico para exibir na tabela de gerenciamento.
   * Assumindo que você criará um GET no controller para listar por dia/médico.
   */
  listarSlotsPorMedico: async (medicoId: string, dataIso: string) => {
      // Exemplo de URL: /admin/slots?medicoId=...&data=2025-12-05
      // Ajuste conforme seu endpoint de listagem real
      return api.get<any[]>(`${ENDPOINT}?medicoId=${medicoId}&data=${dataIso}`);
  }
};