import React, { useMemo } from 'react';
import styles from './SlotListTable.module.scss';
import Swal from 'sweetalert2';
import { ActionMenu } from '../../../../../../components/ActionMenu/ActionMenu';
import Table from '../../../../../../components/Tables/Tables';
import { ColumnType } from '../../../../../../components/Tables/types';
import { useSlotManagement } from '../../hooks/useSlotManagement';

// Tipo de dado que vem do Backend (exemplo)
interface SlotData {
  id: number;
  dataHoraInicio: string; // Ex: "2025-12-05T08:00:00"
  dataHoraFim: string; // Ex: "2025-12-05T08:30:00"
  status: 'DISPONIVEL' | 'AGENDADO' | 'BLOQUEADO' | 'FINALIZADO';
  valor?: number;
}

interface SlotListTableProps {
  slots: SlotData[];
  onRefresh: () => void; // Recarrega a lista após delete/update
}

export const SlotListTable: React.FC<SlotListTableProps> = ({ slots, onRefresh }) => {
  const { removeSlot, editSlot } = useSlotManagement();

  const handleUpdateStatus = async (slotId: number, status: 'BLOQUEADO' | 'DISPONIVEL') => {
    const success = await editSlot(slotId, { status: status });
    if (success) {
      Swal.fire('Sucesso', `Status alterado para ${status}.`, 'success');
      onRefresh();
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
     Swal.fire({
      title: 'Tem certeza?',
      text: 'Você irá excluir este horário. Se ele estiver agendado, a exclusão falhará.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, Deletar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await removeSlot(slotId);
        if (success) {
          Swal.fire('Deletado!', 'O horário foi removido.', 'success');
          onRefresh();
        }
      }
    });
  };


  // Mapeia os dados brutos para a estrutura da Tabela
  const data = useMemo(() => {
    return slots.map((slot) => {
      // Formata data e hora para exibição
      const date = new Date(slot.dataHoraInicio);
      const dataFormatada = date.toLocaleDateString('pt-BR');
      const horaInicio = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const horaFim = new Date(slot.dataHoraFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const horaCompleta = `${horaInicio} - ${horaFim}`;


      return {
        id: slot.id,
        data: dataFormatada,
        hora: horaCompleta,
        valor: slot.valor ? `R$ ${slot.valor.toFixed(2)}` : 'N/A',
        // Renderização Customizada do Status (Badge)
        statusDisplay: (
          <span className={`${styles.badge} ${styles[slot.status.toLowerCase()]}`}>
            {slot.status}
          </span>
        ),
        // Renderização Customizada das Ações (ActionMenu)
        acoes: (
          <ActionMenu 
            // O update aqui será para Bloquear/Desbloquear o horário
            onUpdate={() => {
              // Alterna entre DISPONIVEL e BLOQUEADO
              const newStatus = slot.status === 'DISPONIVEL' ? 'BLOQUEADO' : 'DISPONIVEL';
              handleUpdateStatus(slot.id, newStatus);
            }}
            onDelete={() => handleDeleteSlot(slot.id)}
          />
        )
      };
    });
  }, [slots, onRefresh]);

  // Definição das colunas
  const columns: ColumnType<typeof data[0]>[] = [
    { header: 'Data', accessor: 'data' },
    { header: 'Horário', accessor: 'hora' },
    { header: 'Valor', accessor: 'valor' },
    { header: 'Status', accessor: 'statusDisplay' }, 
    { header: 'Ações', accessor: 'acoes' }           
  ];

  if (slots.length === 0) {
    return <div className={styles.emptyState}>Nenhum horário cadastrado para este período. Use o formulário acima para gerar a agenda.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <h3 className={styles.tableTitle}>Agenda Detalhada (Slots Individuais)</h3>
      <Table colunas={columns} dados={data} />
    </div>
  );
};