import api from '../../../../shared/services/api';
import type {
  Appointment,
  NewAppointmentData,
  UpdateAppointmentData,
} from '../types/appointment.type';

/**
 * O endpoint base para o recurso de agendamentos no backend.
 */
const APPOINTMENTS_ENDPOINT = '/admin/appointments';

/**
 * Busca a lista de consultas.
 */
export const getAppointments = async (): Promise<Appointment[]> => {
  return await api.get<Appointment[]>(APPOINTMENTS_ENDPOINT);
};

/**
 * Cria uma nova consulta.
 */
export const createAppointment = async (
  appointmentData: NewAppointmentData
): Promise<Appointment> => {
  return await api.post<Appointment>(APPOINTMENTS_ENDPOINT, appointmentData);
};

/**
 * Atualiza uma consulta existente.
 */
export const updateAppointment = async (
  id: number | string,
  appointmentData: UpdateAppointmentData
): Promise<Appointment> => {
  return await api.put<Appointment>(`${APPOINTMENTS_ENDPOINT}/${id}`, appointmentData);
};

/**
 * Deleta uma consulta.
 */
export const deleteAppointment = async (id: number | string): Promise<void> => {
  await api.delete(`${APPOINTMENTS_ENDPOINT}/${id}`);
};