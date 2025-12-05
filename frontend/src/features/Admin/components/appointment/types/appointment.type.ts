// --- Interfaces de Paginação ---
export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  // Propriedades adicionadas para compatibilidade com forPages.utils
  empty: boolean; 
  first: boolean;
  numberOfElements: number;
}

// --- DTO de Visualização (READ) - AppointmentAdminResponseDTO ---
// Usado na Tabela do Admin (GET /consultas ou GET /requests como Admin)
export interface AppointmentAdminResponse {
  id: string;
  
  // Relacionamentos (IDs para Edição)
  pacienteId: string;
  medicoId: string;
  horarioSlotId: string;
  tipoConsultaId: string;

  // Dados Visuais (Para a Tabela)
  pacienteNome: string;
  medicoNome: string;
  especialidadeNome: string;
  
  // Dados de Exibição
  data: string;    // String formatada ou ISO
  horario: string; // String formatada ou ISO
  status: string;  // "AGENDADA", "PENDENTE", etc.
  sintomas?: string;
}

// --- DTO de Operação (WRITE) - AppointmentOperationDTO ---
// Usado para Criar, Editar e Atualizar Status (POST/PUT)
export interface AppointmentOperation {
  patientId: string;      // Obrigatório para Admin
  horarioSlotId: string;  // Obrigatório
  tipoConsultaId: string; // Obrigatório
  sintomas?: string;
  status?: string;        // Usado na edição/atualização
}

// --- Options (Allow) ---
export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface ConsultaFormOptionsResponse {
  medicos: FormSelectOption[];
  tipos: FormSelectOption[];
  dias: FormSelectOption[];
  horarios: FormSelectOption[];
}