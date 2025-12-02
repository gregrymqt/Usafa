// src/types/slot.types.ts

export type SlotStatus = 'DISPONIVEL' | 'AGENDADO' | 'BLOQUEADO' | 'FINALIZADO' | 'CANCELADO';

// Dados para gerar a agenda (Loop)
export interface GerarAgendaData {
  medicoId: string;       // PublicID do médico
  inicio: string;         // Data ISO: "2025-12-05T08:00:00"
  fim: string;            // Data ISO: "2025-12-05T18:00:00"
  duracaoMinutos: number; // Ex: 30
}

// Dados para alterar um slot específico
export interface AtualizarSlotData {
  novoStatus?: SlotStatus;
}