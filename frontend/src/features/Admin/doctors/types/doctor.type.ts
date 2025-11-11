/**
 * Interface base para um Doutor
 */
export interface Doctor {
  id: number | string; // Permitindo string caso a API use UUIDs
  name: string;
  email: string;
  crm: string;
  specialty: string;
}

/**
 * Tipo para criação de um novo Doutor (sem o 'id')
 */
export type NewDoctorData = Omit<Doctor, 'id'>;

/**
 * Tipo para atualização de um Doutor (todos os campos são opcionais)
 */
export type UpdateDoctorData = Partial<NewDoctorData>;