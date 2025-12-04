export interface FormSelectOption {
  value: string | number; 
  label: string;
}

// Interface unificada para o que vem da API de listagem
export interface SolicitacaoSummary {
  id: string;
  sintomas?: string;
  dia: string;
  horario: string;
  status: string;
  doctorName: string;          // Era 'medico'
  appointmentTypeName: string; // Era 'tipo'
  patientName: string;
  patientId: string;
  horarioSlotId: string;
  appointmentTypeId: string;
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

export interface NotificationEnvelope<T> {
  type: string;    // Ex: "SOLICITACAO_RECEBIDA"
  message: string; // Ex: "Recebemos seu pedido..."
  data: T;         // O objeto principal (ConsultaSummary, etc)
}