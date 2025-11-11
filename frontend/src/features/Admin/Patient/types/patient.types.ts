/**
 * Interface base para um Paciente
 */
export interface Patient {
  id: number | string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string; // Formato ISO (ex: "1990-10-25T00:00:00Z")
}

/**
 * Tipo para criação de um novo Paciente (sem o 'id')
 */
export type NewPatientData = Omit<Patient, 'id'>;

/**
 * Tipo para atualização de um Paciente (todos os campos são opcionais)
 */
export type UpdatePatientData = Partial<NewPatientData>;

/**
 * Tipo para os dados do formulário (usa YYYY-MM-DD)
 */
export type PatientFormData = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string; // Formato YYYY-MM-DD
};