// Definição de opção para Selects (Reutilizável)
export interface FormSelectOption {
  value: string | number;
  label: string;
}

/**
 * [cite_start]Representa uma consulta existente (para a Tabela) [cite: 33]
 */
export interface Consulta {
  id: string;
  medico: string;
  tipo: string;
  dia: string; // Vem formatado do backend ou do slot
  horario: string;
  status: 'Pendente' | 'Confirmada' | 'Realizada' | 'Agendada';
}

/**
 * [cite_start]Representa os dados do formulário de envio [cite: 35]
 * ATUALIZADO para bater com AppointmentRequestDto do Backend
 */
export interface ConsultaRequest {
  patientId: string;       // ID do usuário logado
  horarioSlotId: number;   // ID do slot escolhido (Substitui dia/horario/medico)
  tipoConsultaId: string;  // ID do tipo
  sintomas: string;
}

/**
 * [cite_start]Dados para o Modal de Sucesso [cite: 36]
 */
export interface ConsultaSummary {
  protocolo: string;
  medico: string;
  tipo: string;
  dia: string;
  horario: string;
  sintomas: string;
}

/**
 * [cite_start]Opções para preencher os <select> [cite: 38]
 */
export interface ConsultaFormOptions {
  medicos: FormSelectOption[]; // Útil se quiser filtrar slots no front
  tipos: FormSelectOption[];
  // 'dias' foi removido pois a data está dentro do slot
  horarios: FormSelectOption[]; // Agora contém a lista de Slots (ID, Label="25/10 14:00 - Dr. X")
}


export interface GetConsultasParams {
  page: number;
  size: number;
  search: string;
}

export interface NotificationEnvelope<T> {
  type: string;
  message: string;
  data: T;
}

export interface Solicitacao {
  id: string;
  dia: string;      // "2023-10-25"
  horario: string;  // "14:30"
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA';
  doctorName: string;
  appointmentTypeName: string;
  sintomas: string;
}