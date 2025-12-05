import React, { useMemo, useState } from 'react';
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
  // Adicionamos esta prop para enviar o ID digitado para quem for buscar os dados
  onSearch: (medicoId: string) => void;
  isLoading?: boolean; // Opcional: para desabilitar o botão enquanto busca
}

export const SlotListTable: React.FC<SlotListTableProps> = ({ 
  slots, 
  onRefresh, 
  onSearch,
  isLoading = false 
}) => {
  const { removeSlot, editSlot } = useSlotManagement();
  
  // Estado local para controlar o input de busca
  const [localMedicoId, setLocalMedicoId] = useState('');

  // Lógica de Atualizar Status
  const handleUpdateStatus = async (slotId: number, status: 'BLOQUEADO' | 'DISPONIVEL') => {
    const success = await editSlot(slotId, { status: status });
    if (success) {
      Swal.fire('Sucesso', `Status alterado para ${status}.`, 'success');
      onRefresh(); // Recarrega usando a busca atual
    }
  };

  // Lógica de Deletar
  const handleDeleteSlot = async (slotId: number) => {
    const success = await removeSlot(slotId);
    if (success) {
      onRefresh();
    }
  };

  // Função disparada ao clicar em buscar
  const handleSearchClick = () => {
    if (localMedicoId.trim()) {
      onSearch(localMedicoId);
    } else {
        Swal.fire('Atenção', 'Digite o ID do médico para buscar.', 'warning');
    }
  };

  // Transformação de Dados
  const data = useMemo<SlotTableRow[]>(() => {
    // Proteção caso slots venha undefined
    if (!slots) return [];

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
        statusDisplay: (
          <span className={`${styles.badge} ${styles[slot.status.toLowerCase()]}`}>
            {slot.status} 
          </span>
        ),
        acoes: (
          <ActionMenu 
            onUpdate={() => {
              const newStatus = slot.status === 'DISPONIVEL' ? 'BLOQUEADO' : 'DISPONIVEL';
              handleUpdateStatus(slot.id, newStatus);
            }}
            onDelete={() => handleDeleteSlot(slot.id)}
          />
        )
      };
    });
  }, [slots, onRefresh]); 

  // Definição das Colunas
  const columns: ColumnType<SlotTableRow>[] = [
    { header: 'Data', accessor: 'data' },
    { header: 'Horário', accessor: 'hora' },
    { header: 'Valor', accessor: 'valor' },
    { header: 'Status', accessor: 'statusDisplay' }, 
    { header: 'Ações', accessor: 'acoes' }           
  ];

  return (
    <div className={styles.tableWrapper}>
      
      {/* 1. ÁREA DE BUSCA (INPUT) - Agora sempre visível */}
      <div className={styles.searchHeader}>
        <div className={styles.inputGroup}>
            <label htmlFor="medicoIdSearch">ID Público do Médico</label>
            <input 
                id="medicoIdSearch"
                type="text" 
                placeholder="Ex: 550e8400-e29b..."
                value={localMedicoId}
                onChange={(e) => setLocalMedicoId(e.target.value)}
            />
        </div>
        <button 
            onClick={handleSearchClick}
            disabled={isLoading}
            className={styles.searchButton}
        >
            {isLoading ? 'Buscando...' : '🔍 Buscar Agenda'}
        </button>
      </div>

      <h3 className={styles.tableTitle}>Agenda Detalhada</h3>

      {/* 2. TABELA OU EMPTY STATE - Renderização condicional dentro do layout */}
      {!slots || slots.length === 0 ? (
        <div className={styles.emptyState}>
          {localMedicoId 
            ? "Nenhum horário encontrado para este médico." 
            : "Insira o ID do médico acima para visualizar a agenda."}
        </div>
      ) : (
        <Table colunas={columns} dados={data} /> 
      )}
    </div>
  );
};