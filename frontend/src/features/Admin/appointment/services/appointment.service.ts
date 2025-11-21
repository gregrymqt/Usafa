import api from '../../../../shared/services/api.service';
import type { Page } from '../../../../shared/utils/forPages.utils';
import type {
  Appointment,
  AppointmentFormData,
} from '../types/appointment.type';

interface GetAppointmentsParams {
  page: number;
  size: number;
  search: string;
}

/**
 * O endpoint base para o recurso de agendamentos no backend.
 */
const APPOINTMENTS_ENDPOINT = '/admin/appointments';

/**
 * Busca a lista de consultas com suporte para paginação e busca.
 */
export const getAppointments = async (params: GetAppointmentsParams): Promise<Page<Appointment>> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  });

  if (params.search) {
    queryParams.append('search', params.search);
  }
  return await api.get<Page<Appointment>>(`${APPOINTMENTS_ENDPOINT}?${queryParams.toString()}`);
};

/**
 * Cria uma nova consulta.
 */
export const createAppointment = async (
  appointmentData: AppointmentFormData
): Promise<Appointment> => {
  return await api.post<Appointment>(APPOINTMENTS_ENDPOINT, appointmentData);
};

/**
 * Atualiza uma consulta existente.
 */
export const updateAppointment = async (
  id: number | string,
  appointmentData: AppointmentFormData
): Promise<Appointment> => {
  return await api.put<Appointment>(`${APPOINTMENTS_ENDPOINT}/${id}`, appointmentData);
};

/**
 * Deleta uma consulta.
 */
export const deleteAppointment = async (id: number | string): Promise<void> => {
  await api.delete(`${APPOINTMENTS_ENDPOINT}/${id}`);
};
