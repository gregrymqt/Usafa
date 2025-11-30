/**
 * Interface base para um Doutor
 */
export interface Doctor {
  id: number | string; // Permitindo string caso a API use UUIDs
  name: string;
  email: string;
  crm: string;
  specialty: string;
  picture: string; // URL da foto de perfil
}

/**
 * Tipo para criação de um novo Doutor (sem o 'id')
 */
export type NewDoctorData = Omit<Doctor, 'id'>;

/**
 * Tipo para atualização de um Doutor (todos os campos são opcionais)
 */
export type UpdateDoctorData = Partial<NewDoctorData>;

export interface DoctorAdminProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
  loadMoreDoctors: () => void;
  hasMore: boolean;
}

export interface GetDoctorsParams {
  page: number;
  size: number;
  search: string;
}