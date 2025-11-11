// Importando os tipos que já devem existir

import type { Doctor } from "../../doctors/types/doctor.type";
import type { Patient } from "../../Patient/types/patient.types";


// (Placeholder do Paciente foi REMOVIDO)

/**
 * Status possíveis de uma consulta
 */
export type AppointmentStatus = 'Agendada' | 'Concluída' | 'Cancelada';

/**
 * Interface base para uma Consulta
 * (Pode ser mais complexa, com objetos Doctor/Patient aninhados)
 */
export interface Appointment {
  id: number | string;
  patient: Patient; // Objeto paciente (agora tipo real)
  doctor: Doctor; // Objeto doutor (simplificado)
  date: string; // Data no formato ISO (ex: "2023-12-25T14:30:00Z")
  status: AppointmentStatus;
}

/**
 * Tipo para os dados do formulário (usa IDs)
 */
export interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  status: AppointmentStatus;
}

/**
 * Tipo para criação (combina data e hora)
 */
export type NewAppointmentData = Omit<AppointmentFormData, 'date' | 'time'> & {
  dateTime: string; // Formato ISO
};

/**
 * Tipo para atualização de uma Consulta (parcial)
 */
export type UpdateAppointmentData = Partial<NewAppointmentData>;