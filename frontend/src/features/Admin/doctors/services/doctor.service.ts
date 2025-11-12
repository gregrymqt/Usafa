
import api from '../../../../shared/services/api';
import type {
  Doctor,
  NewDoctorData,
  UpdateDoctorData,
} from '../types/doctor.type';

/**
 * O endpoint base para o recurso de médicos no backend.
 * Seguindo o padrão de /admin/patients
 */
const DOCTORS_ENDPOINT = '/admin/doctors';

/**
 * Busca a lista de médicos.
 */
export const getDoctors = async (): Promise<Doctor[]> => {
  return await api.get<Doctor[]>(DOCTORS_ENDPOINT);
};

/**
 * Cria um novo médico.
 */
export const createDoctor = async (
  doctorData: NewDoctorData
): Promise<Doctor> => {
  return await api.post<Doctor>(DOCTORS_ENDPOINT, doctorData);
};

/**
 * Atualiza um médico existente.
 */
export const updateDoctor = async (
  id: number | string,
  doctorData: UpdateDoctorData
): Promise<Doctor> => {
  return await api.put<Doctor>(`${DOCTORS_ENDPOINT}/${id}`, doctorData);
};

/**
 * Deleta um médico.
 */
export const deleteDoctor = async (id: number | string): Promise<void> => {
  await api.delete(`${DOCTORS_ENDPOINT}/${id}`);
};