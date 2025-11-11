
// Usando API de mock (jsonplaceholder) como no exemplo anterior.

import { api } from "../../../../shared";
import type { Doctor, NewDoctorData, UpdateDoctorData } from "../types/doctor.type";

// Troque os endpoints pela sua API real.
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Busca a lista de médicos.
 * (Mock: usando /users e adaptando)
 */
export const getDoctors = async (): Promise<Doctor[]> => {
  // Em uma API real: const users = await api.get('/doctors');
  const users = await api.get<Doctor[]>(`${MOCK_API_URL}/users`);
  
  // Adapta os dados do mock para a nossa interface Doctor
  return users.map((user: Doctor) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    crm: `CRM/SP ${10000 + Number(user.id)}`, // Mock CRM
    specialty: user.specialty.split(' ')[0] || 'Clínico Geral', // Mock Specialty
  }));
};

/**
 * Cria um novo médico.
 */
export const createDoctor = async (doctorData: NewDoctorData): Promise<Doctor> => {
  // Em uma API real: const newDoctor = await api.post('/doctors', doctorData);
  const response = await api.post<Doctor>(`${MOCK_API_URL}/users`, doctorData);
  
  // A API mock não retorna os dados completos, então simulamos
  return {
    ...doctorData,
    id: response.id || Math.floor(Math.random() * 1000) + 10,
  };
};

/**
 * Atualiza um médico existente.
 */
export const updateDoctor = async (id: number | string, doctorData: UpdateDoctorData): Promise<Doctor> => {
  // Em uma API real: const updatedDoctor = await api.put(`/doctors/${id}`, doctorData);
  const response = await api.put<Doctor>(`${MOCK_API_URL}/users/${id}`, doctorData);

  // A API mock não retorna todos os dados corretos
  return {
    ...response, // Contém name, email, etc. da API
    id: id,
    crm: doctorData.crm || response.crm, // Garante que nossos campos existam
    specialty: doctorData.specialty || response.specialty,
  };
};

/**
 * Deleta um médico.
 */
export const deleteDoctor = async (id: number | string): Promise<void> => {
  // Em uma API real: await api.delete(`/doctors/${id}`);
  await api.delete(`${MOCK_API_URL}/users/${id}`);
};