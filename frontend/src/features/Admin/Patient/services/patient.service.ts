import api from '../../../../shared/services/api.service';
import type { Page } from '../../../../shared/utils/forPages.utils';
import type {
  Patient,
  NewPatientData,
  UpdatePatientData,
  GetPatientsParams,
} from '../types/patient.types';

// O endpoint base para o recurso de pacientes no backend.
const PATIENTS_ENDPOINT = '/admin/patients';

/**
 * Busca a lista de pacientes com suporte para paginação e busca.
 * @param params - Objeto contendo os parâmetros de paginação e busca.
 */
export const getPatients = async (
  params: GetPatientsParams
): Promise<Page<Patient>> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  });

  if (params.search) {
    queryParams.append('search', params.search);
  }

  return await api.get<Page<Patient>>(`${PATIENTS_ENDPOINT}?${queryParams.toString()}`);
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