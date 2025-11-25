import type { Patient } from "../../Patient/types/patient.types";
import type { Doctor } from "../../doctors/types/doctor.type";

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
  horarioSlotId: number;
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
  horarioSlotId: number; // ID do Slot (Substitui data/hora/medico)
  tipoConsultaId: string; // ID da Especialidade
  status: AppointmentStatus;
  sintomas?: string;
  date: string; // Mantido para compatibilidade, mas não usado no form
  time: string; // Mantido para compatibilidade, mas não usado no form
}

/**
 * Opções para os Selects
 */
export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AppointmentFormData | null;
  isLoading: boolean;
  // Opções necessárias para o Admin preencher o form
  patientOptions: FormSelectOption[];
  typeOptions: FormSelectOption[]; // Tipos de consulta
  slotOptions: FormSelectOption[]; // Lista de horários (ID do Slot)
}


export interface AppointmentAdminProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onEditAppointment: (id: string, data: AppointmentFormData) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  loadMoreAppointments: () => void;
}