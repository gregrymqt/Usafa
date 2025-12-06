// --- DTOs de Apoio (Allow/Options) ---
export interface FormSelectOption {
  value: string | number; 
  label: string;
}

export interface ConsultaFormOptionsResponse {
  medicos: FormSelectOption[];
  tipos: FormSelectOption[];
  // O backend manda 'dias' também, adicionei aqui caso precise futuramente
  dias?: FormSelectOption[]; 
  horarios: FormSelectOption[];
}

// --- DTO de Entrada (AppointmentOperationDTO) ---
export interface ConsultaRequest {
  patientId: string; // O Backend pega do token, mas se vc manda, ok.
  horarioSlotId: string;
  tipoConsultaId: string;
  sintomas: string;
  // status: não precisa mandar na criação pelo usuário
}

export type AppointmentStatus =
  | "PENDENTE"
  | "ACEITA"
  | "RECUSADA"
  | "CONFIRMADA"
  | "CANCELADA"
  | "CONCLUIDA";

// --- DTO de Resposta (AppointmentUserResponseDTO) ---
// Renomeei para ficar claro que é a visão do usuário
export interface AppointmentUserResponse {
  id: string;
  medicoNome: string;      // Corrigido de doctorName
  especialidade: string;   // Corrigido de appointmentTypeName
  data: string;            // Corrigido de dia
  horario: string;
  status: AppointmentStatus;
  sintomas?: string;
}

// Interface genérica de paginação
export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  size: number;
  number: number;
}