import api from '../../../../../shared/services/api.service';
import type { Page } from '../../../../../shared/utils/forPages.utils';
import type {
  Patient,
  NewPatientData,
  UpdatePatientData,
  GetPatientsParams,
} from '../types/patient.type';

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

  // Garante que o parâmetro de busca seja enviado apenas se não for uma string vazia.
  if (params.search && params.search.trim() !== '') {
    queryParams.append('search', params.search);
  }

  return await api.get<Page<Patient>>(`${PATIENTS_ENDPOINT}?${queryParams.toString()}`);
};

/**
 * Busca um paciente específico pelo CPF.
 * Utiliza o método POST para enviar o CPF de forma segura no corpo da requisição.
 * Retorna um array de pacientes (geralmente com um ou zero resultados).
 */
export const searchPatientByCpf = async (cpf: string): Promise<Patient[]> => {
  // Usar POST para não expor o CPF na URL.
  // O backend deve ter um endpoint que aceite um corpo de requisição para busca.
  // Ex: @PostMapping("/search-by-cpf")
  return await api.post<Patient[]>(`${PATIENTS_ENDPOINT}/search-by-cpf`, { cpf });
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