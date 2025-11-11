import api from '../../../../shared/services/api';
import type {
  Patient,
  NewPatientData,
  UpdatePatientData,
} from '../types/patient.types';

// Usando API de mock (jsonplaceholder)
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Busca a lista de pacientes.
 * (Mock: usando /users e adaptando)
 */
export const getPatients = async (): Promise<Patient[]> => {
  // Em uma API real: const users = await api.get('/patients');
  const users = await api.get<Patient[]>(`${MOCK_API_URL}/users`);

  // Adapta os dados do mock para a nossa interface Patient
  return users.map((user: any) => {
    // Cria datas de nascimento mockadas
    const birthYear = 1970 + (user.id % 30); // 1970 - 1999
    const birthMonth = String(1 + (user.id % 12)).padStart(2, '0');
    const birthDay = String(1 + (user.id % 28)).padStart(2, '0');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone.split(' ')[0], // Pega só a primeira parte do mock
      cpf: `00${user.id}.000.000-0${user.id}`, // Mock CPF
      birthDate: `${birthYear}-${birthMonth}-${birthDay}T00:00:00Z`, // Mock ISO
    };
  });
};

/**
 * Cria um novo paciente.
 */
export const createPatient = async (
  patientData: NewPatientData
): Promise<Patient> => {
  // Em uma API real: const newPatient = await api.post('/patients', patientData);
  const response = await api.post<Patient>(`${MOCK_API_URL}/users`, patientData);

  // A API mock não retorna os dados completos, então simulamos
  return {
    ...patientData,
    id: response.id || Math.floor(Math.random() * 1000) + 10,
  };
};

/**
 * Atualiza um paciente existente.
 */
export const updatePatient = async (
  id: number | string,
  patientData: UpdatePatientData
): Promise<Patient> => {
  // Em uma API real: const updatedPatient = await api.put(`/patients/${id}`, patientData);
  const response = await api.put<Patient>(`${MOCK_API_URL}/users/${id}`, patientData);

  // A API mock não retorna todos os dados corretos
  return {
    ...response, // Contém name, email, etc. da API
    id: id,
    cpf: patientData.cpf || response.cpf,
    phone: patientData.phone || response.phone,
    birthDate: patientData.birthDate || response.birthDate,
  };
};

/**
 * Deleta um paciente.
 */
export const deletePatient = async (id: number | string): Promise<void> => {
  // Em uma API real: await api.delete(`/patients/${id}`);
  await api.delete(`${MOCK_API_URL}/users/${id}`);
};