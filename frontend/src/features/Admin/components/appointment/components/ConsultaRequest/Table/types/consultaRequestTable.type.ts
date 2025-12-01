// (Caminho: .../components/ConsultaRequestTable/types/consultaRequestTable.type.ts)

import type { ReactNode } from 'react';

/**
 * Define os dados que a Tabela genérica irá renderizar.
 * Os 'accessor' das colunas [cite: 3] batem com estas chaves.
 */
export interface TableRowData {
  id: string;
  paciente: string;
  medico: string;
  data: string;
  status: ReactNode; // Será um componente <span/>
  actions: ReactNode; // Será um componente <ActionMenu/>
}

/**
 * Define as props que o componente ConsultaRequestTable recebe[cite: 7].
 */
export interface ConsultaRequestTableProps {
  requests: ConsultaDocument[];
  isLoading: boolean;
  onUpdateStatus: (request: ConsultaDocument) => void;
  onDelete: (id: string) => void;
}

export enum StatusConsulta {
  PENDENTE = 'PENDENTE',
  ACEITA = 'ACEITA',
  RECUSADA = 'RECUSADA'
}

/**
 * Define a estrutura do documento que vem do MongoDB
 * (coleção 'solicitacoes_consulta').
 */
export interface ConsultaDocument {
  // IDs
  id: string; // ID do MongoDB
  userPublicId: string;
  medicoPublicId: string;
  tipoConsultaPublicId: string;

  // Dados Desnormalizados (para a tabela)
  nomePaciente: string;
  nomeMedico: string;
  nomeTipoConsulta: string;

  // Dados da Consulta
  dia: string; // "2025-12-01"
  horario: string; // "10:00"
  sintomas: string | null;
  
  status: StatusConsulta;
}
