import * as api from "../../../../shared";
import type { Doctor } from "../../doctors/types/doctor.type";
import type { Patient, Appointment, AppointmentStatus, NewAppointmentData, UpdateAppointmentData } from "../types/appointment.type";

// Usaremos /posts para simular as consultas.
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com';

// --- Dados Mockados para simular a resposta ---
// (Já que a API /posts não retorna médicos/pacientes)
const MOCK_DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. House', crm: 'CRM/SP 12345', specialty: 'Infectologia', email: 'house@gmail.com' },
  { id: 2, name: 'Dr. John Watson', crm: 'CRM/RJ 54321', specialty: 'Clínico Geral', email: 'john@gmail.com' },
];
const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'Paciente Um' },
  { id: 2, name: 'Paciente Dois' },
];
// --- Fim dos Dados Mockados ---

/**
 * Busca a lista de consultas.
 * (Mock: usando /posts e adaptando)
 */
export const getAppointments = async (): Promise<Appointment[]> => {
  // Em uma API real: const data = await api.get('/appointments');
  const posts = await api.get<Appointment[]>(`${MOCK_API_URL}/posts?_limit=10`); // Limita a 10 mocks

  // Adapta os dados do mock para a nossa interface Appointment
  return posts.map((post: any, index: number) => {
    const statusValues: AppointmentStatus[] = ['Agendada', 'Concluída', 'Cancelada'];
    const date = new Date();
    date.setDate(date.getDate() + index); // Datas futuras
    date.setHours(10 + (index % 5), (index % 2) * 30); // Horas variadas

    return {
      id: post.id,
      patient: MOCK_PATIENTS[index % MOCK_PATIENTS.length],
      doctor: MOCK_DOCTORS[index % MOCK_DOCTORS.length],
      date: date.toISOString(),
      status: statusValues[index % statusValues.length],
    };
  });
};

/**
 * Cria uma nova consulta.
 */
export const createAppointment = async (
  appointmentData: NewAppointmentData
): Promise<Appointment> => {
  // Em uma API real: const newAppointment = await api.post('/appointments', appointmentData);
  const response = await api.post<Appointment>(`${MOCK_API_URL}/posts`, appointmentData);

  // A API mock não retorna os dados completos, então simulamos
  // Em um caso real, o backend retornaria o objeto 'Appointment' completo
  return {
    ...appointmentData,
    id: response.id || Math.floor(Math.random() * 1000) + 10,
    date: appointmentData.dateTime, // O backend deve tratar isso
    // Simulação de busca de objetos
    patient: MOCK_PATIENTS.find(p => p.id === parseInt(appointmentData.patientId)) || MOCK_PATIENTS[0],
    doctor: MOCK_DOCTORS.find(d => d.id === parseInt(appointmentData.doctorId)) || MOCK_DOCTORS[0],
  };
};

/**
 * Atualiza uma consulta existente.
 */
export const updateAppointment = async (
  id: number | string,
  appointmentData: UpdateAppointmentData
): Promise<Appointment> => {
  // Em uma API real: const updated = await api.put(`/appointments/${id}`, appointmentData);
  const response = await api.put<Appointment>(`${MOCK_API_URL}/posts/${id}`, appointmentData);

  // Simulação de resposta
  return {
    ...response,
    id: id,
    date: appointmentData.dateTime || new Date().toISOString(),
    status: appointmentData.status || 'Agendada',
    patient: MOCK_PATIENTS.find(p => p.id === parseInt(appointmentData.patientId || '')) || MOCK_PATIENTS[0],
    doctor: MOCK_DOCTORS.find(d => d.id === parseInt(appointmentData.doctorId || '')) || MOCK_DOCTORS[0],
  };
};

/**
 * Deleta uma consulta.
 */
export const deleteAppointment = async (id: number | string): Promise<void> => {
  // Em uma API real: await api.delete(`/appointments/${id}`);
  await api.delete(`${MOCK_API_URL}/posts/${id}`);
};