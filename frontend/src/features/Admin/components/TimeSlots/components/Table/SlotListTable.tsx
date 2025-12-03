import React, { useMemo } from 'react';
import styles from './SlotListTable.module.scss';
import Swal from 'sweetalert2';
import { ActionMenu } from '../../../../../../components/ActionMenu/ActionMenu';
import Table from '../../../../../../components/Tables/Tables';
import { ColumnType } from '../../../../../../components/Tables/types';
import { useSlotManagement } from '../../hooks/useSlotManagement';

// 1. Interface dos dados que vêm do Backend
interface SlotData {
  id: number;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: 'DISPONIVEL' | 'AGENDADO' | 'BLOQUEADO' | 'FINALIZADO';
  valor?: number;
}

// 2. Interface Nova: Define exatamente o que vai ser renderizado na Tabela
interface SlotTableRow {
  id: number;
  data: string;
  hora: string;
  valor: string;
  statusDisplay: React.ReactNode; 
  acoes: React.ReactNode;      
}

interface SlotListTableProps {
  slots: SlotData[];
  onRefresh: () => void;
}

export const SlotListTable: React.FC<SlotListTableProps> = ({ slots, onRefresh }) => {
  const { removeSlot, editSlot } = useSlotManagement();

  // Lógica de Atualizar Status
  const handleUpdateStatus = async (slotId: number, status: 'BLOQUEADO' | 'DISPONIVEL') => {
    const success = await editSlot(slotId, { status: status });
    if (success) {
      Swal.fire('Sucesso', `Status alterado para ${status}.`, 'success');
      onRefresh();
    }
  };

  // Lógica de Deletar SIMPLIFICADA
  // O ActionMenu já pede confirmação e mostra mensagem de sucesso.
  // Aqui só executamos a ação lógica.
  const handleDeleteSlot = async (slotId: number) => {
    const success = await removeSlot(slotId);
    
    if (success) {
      // Apenas recarrega a lista, pois o ActionMenu já mostrou o alerta de "Deletado!"
      onRefresh();
    }
  };

  // 3. Transformação de Dados com Tipagem Explícita
  const data = useMemo<SlotTableRow[]>(() => {
    return slots.map((slot) => {
      const date = new Date(slot.dataHoraInicio);
      const dataFormatada = date.toLocaleDateString('pt-BR');
      const horaInicio = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const horaFim = new Date(slot.dataHoraFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      return {
        id: slot.id,
        data: dataFormatada,
        hora: `${horaInicio} - ${horaFim}`,
        valor: slot.valor ? `R$ ${slot.valor.toFixed(2)}` : 'N/A',
        
        // Renderização do Badge de Status
        statusDisplay: (
          <span className={`${styles.badge} ${styles[slot.status.toLowerCase()]}`}>
            {slot.status} 
          </span>
        ),
        
        // Renderização do Menu de Ações
        acoes: (
          <ActionMenu 
            onUpdate={() => {
              const newStatus = slot.status === 'DISPONIVEL' ? 'BLOQUEADO' : 'DISPONIVEL';
              handleUpdateStatus(slot.id, newStatus);
            }}
            // Passamos a função simplificada que não abre mais modal
            onDelete={() => handleDeleteSlot(slot.id)}
          />
        )
      };
    });
  }, [slots, onRefresh]); 

  // 4. Definição das Colunas
  const columns: ColumnType<SlotTableRow>[] = [
    { header: 'Data', accessor: 'data' },
    { header: 'Horário', accessor: 'hora' },
    { header: 'Valor', accessor: 'valor' },
    { header: 'Status', accessor: 'statusDisplay' }, 
    { header: 'Ações', accessor: 'acoes' }           
  ];

  // Feedback visual se não houver dados
  if (!slots || slots.length === 0) {
    return (
      <div className={styles.emptyState}>
        Nenhum horário cadastrado para este período.
        Use o formulário acima para gerar a agenda. 
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <h3 className={styles.tableTitle}>Agenda Detalhada</h3>
      <Table colunas={columns} dados={data} /> 
    </div>
  );
};