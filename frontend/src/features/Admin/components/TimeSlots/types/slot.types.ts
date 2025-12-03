// types/slot.types.ts

export type SlotStatus = 'DISPONIVEL' | 'AGENDADO' | 'BLOQUEADO' | 'FINALIZADO';

// 1. Interface que representa EXATAMENTE o que vem da API (JSON)
export interface SlotResponse {
  id: number;
  medicoId?: string; // Pode vir nulo ou undefined da API
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string; // Na API é string genérica
  valor?: number;
}

// 2. Interface que usamos no Front (Tipada e segura)
export interface Slot {
  id: number;
  medicoId: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: SlotStatus; // Aqui travamos nas opções permitidas
  valor?: number;
}

export interface GerarAgendaData {
  medicoId: string;
  inicio: string;
  fim: string;
  duracaoMinutos: number;
}