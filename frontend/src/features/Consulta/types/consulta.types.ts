import type { FormSelectOption } from "../../Admin/appointment/components/AppointmentForm";

/**
 * Representa uma consulta existente (para a Tabela)
 */
export interface Consulta {
  id: string;
  medico: string;
  tipo: string;
  dia: string;
  horario: string;
  status: 'Pendente' | 'Confirmada' | 'Realizada';
}

/**
 * Representa os dados do formulário
 */
export interface ConsultaRequest {
  medicoId: string;
  tipoId: string;
  dia: string;
  horario: string;
  sintomas: string;
}

/**
 * Representa os dados que a API retorna após o agendamento (para o Modal)
 */
export interface ConsultaSummary {
  protocolo: string;
  medico: string;
  tipo: string;
  dia: string;
  horario: string;
  sintomas: string;
}

/**
 * Representa as opções que vêm da API para preencher os <select>
 */
export interface ConsultaFormOptions {
  medicos: FormSelectOption[];
  tipos: FormSelectOption[];
  dias: FormSelectOption[];
  horarios: FormSelectOption[];
}