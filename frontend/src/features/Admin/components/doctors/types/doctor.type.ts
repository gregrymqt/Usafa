/**
 * Interface base para um Doutor
 */
export interface Doctor {
  id: string;
  name: string;
  email: string;
  crm: string;
  specialty: string;    // Nome (Ginecologista)
  specialtyId: string;  // Novo campo (UUID)
  picture?: string;
}

/**
 * Tipo para criação de um novo Doutor (sem o 'id')
 */
export interface NewDoctorData {
  name: string;
  email: string;
  crm: string;
  specialty: string;    // Aqui enviamos o UUID da especialidade selecionada
  imageFile?: File;     // Arquivo opcional
}

/**
 * Tipo para atualização de um Doutor (todos os campos são opcionais)
 */
export type UpdateDoctorData = Partial<NewDoctorData>;

export interface DoctorAdminProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  loadMoreDoctors: () => void;
  hasMore: boolean;
}

export interface GetDoctorsParams {
  page: number;
  size: number;
  search: string;
}