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
  nome: string;
  cpf: string;
  cartaoSus: string;
  endereco: string;
  cep: string;
  proximasConsultas: Consulta[];
  consultasAnteriores: Consulta[];
  picture: string;
}