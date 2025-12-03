import type { Patient } from "../../Patient/types/patient.type";
import type { Doctor } from "../../doctors/types/doctor.type";

export interface Page<T> {
  content: T[];
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type AppointmentStatus =
  | "Agendada"
  | "Concluída"
  | "Cancelada"
  | "Pendente";

/**
 * Interface de Visualização (Para a Tabela)
 */
export interface Appointment {
  id: string;
  patient: Patient;
  doctor: Doctor;
  date: string; // ISO String (Vem do slot)
  status: AppointmentStatus;
  specialty?: string; // Opcional, para exibição
  // --- Campos adicionados para permitir a edição ---
  horarioSlotId: string;
  tipoConsultaId: string;
  sintomas?: string;
  time: string; // Hora extraída do slot
}

/**
 * Interface de Envio (Para Criar/Editar)
 * Alinhada com o DTO do Backend (AppointmentRequestDto)
 */
export interface AppointmentFormData {
  patientId: string; // Admin seleciona o paciente
  horarioSlotId: string; // ID do Slot (Substitui data/hora/medico)
  tipoConsultaId: string; // ID da Especialidade
  status: AppointmentStatus;
  sintomas?: string;
  date: string; // Mantido para compatibilidade, mas não usado no form
  time: string; // Mantido para compatibilidade, mas não usado no form
}

// No Java: ConsultaFormOptionsDTO
export interface ConsultaFormOptionsResponse {
  medicos: FormSelectOption[];
  tipos: FormSelectOption[];    // Essa é a lista de Especialidades
  dias: FormSelectOption[];     // Pode vir vazio inicialmente
  horarios: FormSelectOption[]; // Pode vir vazio inicialmente
}

/**
 * Opções para os Selects
 */
export interface FormSelectOption {
  value: string | number;
  label: string;
}