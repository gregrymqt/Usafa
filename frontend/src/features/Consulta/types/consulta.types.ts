export interface FormSelectOption {
  value: string | number; 
  label: string;
}

// Interface unificada para o que vem da API de listagem
export interface ConsultaSummary {
  id: string;        // UUID ou ID
  medico: string;    // Nome do médico
  tipo: string;      // Especialidade
  dia: string;       // "2025-12-03"
  horario: string;   // "20:30"
  status: string;    // "AGENDADA", "PENDENTE"
  sintomas?: string;
}

// Payload de envio
export interface ConsultaRequest {
  patientId: string;
  horarioSlotId: string; // String para aceitar UUID
  tipoConsultaId: string;
  sintomas: string;
}

export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  size: number;
  number: number;
}

// Resposta do /options
export interface ConsultaFormOptionsResponse {
  medicos: FormSelectOption[];
  tipos: FormSelectOption[];
  horarios: FormSelectOption[];
}