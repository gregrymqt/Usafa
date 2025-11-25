/**
 * Estrutura de uma consulta (agendamento)
 * (Necessário para o tipo UserData)
 */
export interface Consulta {
  id: number;
  data: string;
  horario: string;
  especialidade: string;
  medico: string;
  local: string;
  status?: 'Realizada' | 'Agendada' | 'Cancelada';
}

/**
 * Estrutura dos dados do usuário logado
 * (Este é o tipo principal do seu usuário)
 */
export interface UserData {
  publicId: string;
  nome: string;    // O Form usa 'nome'
  email: string;
  cep: string;
  cartaoSus: string;
  endereco: string;
  proximasConsultas: Consulta[];
  consultasAnteriores: Consulta[];
  picture: string;
  phone?: string;
  birthDate?: string;
}

export interface MeusDadosProps {
  userData: UserData;
  isUpdating: boolean;
  updateError: string | null;
  handleUpdateProfile: (data: UserProfileUpdateDTO) => Promise<boolean>;
}


export interface UserProfileUpdateDTO {
  name: string;
  cep: string;
  picture: string;
}


export interface ProfileUpdateFormProps {
  // O usuário atual, vindo do hook
  user: UserData; 
  // A função de update, vinda do hook
  onUpdate: (data: UserProfileUpdateDTO) => Promise<boolean>; 
  // O estado de loading, vindo do hook
  isUpdating: boolean; 
  // O erro de update, vindo do hook
  updateError: string | null; 
}