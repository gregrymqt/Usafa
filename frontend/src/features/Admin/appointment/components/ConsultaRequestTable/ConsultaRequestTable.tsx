import React, { useMemo } from 'react';
import styles from './ConsultaRequestTable.module.scss';
// Remove 'ConsultaRequestTableProps' - não precisamos mais das props de dados 
import type { TableRowData } from './types/consultaRequestTable.type'; 
import { ActionMenu } from '../../../../../components/ActionMenu/ActionMenu';
import type { ColumnType } from '../../../../../components/Tables/types';
import Table from '../../../../../components/Tables';
import { useConsultaRequests } from '../../hooks/useAppointmentRequest';

// Colunas (igual ao seu arquivo) [cite: 3]
const columns: ColumnType<TableRowData>[] = [
  { header: 'Paciente', accessor: 'paciente' },
  { header: 'Médico', accessor: 'medico' },
  { header: 'Data', accessor: 'data' },
  { header: 'Status', accessor: 'status' },
  { header: 'Ações', accessor: 'actions' },
];

// Helper de data (igual ao seu arquivo) [cite: 4-6]
const formatDateTime = (dia: string, horario: string) => {
  try {
    const date = new Date(`${dia}T${horario}:00`);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) { 
    console.error('Erro ao formatar data e hora:', e);
    return `${dia} ${horario}`;
  }
};

// 2. Remove as PROPS de dados (requests, isLoading, onUpdateStatus, onDelete) 
export const ConsultaRequestTable: React.FC = () => {
  
  // 3. CONSOME O HOOK
  const { 
    requests, 
    isLoading, 
    error, 
    handleUpdateStatus, 
    handleDeleteRequest 
  } = useConsultaRequests();
  
  // 4. Transforma os dados (agora vêm do hook)
  const tableData: TableRowData[] = useMemo(() => {
    if (!requests) return []; // Se 'requests' for null, retorna array vazio

    return requests.map((req) => ({
      id: req.id,
      paciente: req.nomePaciente,
      medico: req.nomeMedico,
      data: formatDateTime(req.dia, req.horario), 
      status: ( // Igual ao seu arquivo [cite: 8]
        <span
          className={`${styles.statusBadge} ${
            styles[`status${req.status.toLowerCase()}`]
          }`}
        >
          {req.status}
        </span>
      ),
      actions: (
        // 5. Passa as funções do HOOK para o ActionMenu [cite: 9]
        <ActionMenu 
          // A ação de "aceitar/recusar" agora é uma "atualização" que deve abrir o formulário
          onUpdate={() => handleUpdateStatus(req.id, "ACEITA")}
          onDelete={() => handleDeleteRequest(req.id)}
        />
      ),
    }));
  // Adiciona as funções do hook (com 'useCallback') nas dependências
  }, [requests, handleUpdateStatus, handleDeleteRequest]);

  // 6. Trata o estado de Loading (igual ao seu arquivo) [cite: 10]
  if (isLoading) { 
    return <p className={styles.loading}>Carregando solicitações...</p>;
  } 

  // 7. (NOVO) Trata o estado de Erro
  if (error) {
    return (
      <p className={styles.loading}>
        Erro ao carregar dados: {error.message} (Status: {error.status})
      </p>
    );
  }

  // 8. Renderiza a tabela (igual ao seu arquivo) [cite: 11]
  return (
    <div className={styles.tableWrapper}>
      <Table<TableRowData>
        colunas={columns}
        dados={tableData}
      />
    </div>
  );
};