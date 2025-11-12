import api from '../../../../shared/services/api';
import type {
  Patient,
  NewPatientData,
  UpdatePatientData,
} from '../types/patient.types';

// O endpoint base para o recurso de pacientes no backend.
const PATIENTS_ENDPOINT = '/admin/patients';

/**
 * Busca a lista de pacientes.
 */
export const getPatients = async (): Promise<Patient[]> => {
  return await api.get<Patient[]>(PATIENTS_ENDPOINT);
};

/**
 * Cria um novo paciente.
 */
export const createPatient = async (
  patientData: NewPatientData
): Promise<Patient> => {
  return await api.post<Patient>(PATIENTS_ENDPOINT, patientData);
};

/**
 * Atualiza um paciente existente.
 */
export const updatePatient = async (
  id: number | string,
  patientData: UpdatePatientData
): Promise<Patient> => {
  return await api.put<Patient>(`${PATIENTS_ENDPOINT}/${id}`, patientData);
};

/**
 * Deleta um paciente.
 */
export const deletePatient = async (id: number | string): Promise<void> => {
  await api.delete(`${PATIENTS_ENDPOINT}/${id}`);
};