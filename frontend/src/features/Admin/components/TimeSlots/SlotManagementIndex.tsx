import React, { useState, useEffect, useCallback } from 'react';
import styles from './SlotManagement.module.scss';
import Swal from 'sweetalert2';

import { SlotGenerationForm } from './components/Form/SlotGenerationForm';
import { SlotListTable } from './components/Table/SlotListTable';
import { slotService } from './services/slot.service';
// Importamos as duas interfaces
import type { Slot, SlotResponse, SlotStatus } from './types/slot.types';

type TabType = 'list' | 'form';

// Helper para validar se a string é um status válido
function parseSlotStatus(statusRaw: string): SlotStatus {
  const upperStatus = statusRaw?.toUpperCase();
  const validStatuses: SlotStatus[] = ['DISPONIVEL', 'AGENDADO', 'BLOQUEADO', 'FINALIZADO'];
  
  // Se for válido retorna ele mesmo (como SlotStatus), senão retorna padrão
  if (validStatuses.includes(upperStatus as SlotStatus)) {
    return upperStatus as SlotStatus;
  }
  return 'DISPONIVEL';
}

export const SlotManagementIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [slots, setSlots] = useState<Slot[]>([]); // Estado tipado corretamente
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentMedicoId, setCurrentMedicoId] = useState<string>('');

  const fetchSlots = useCallback(async () => {
    if (!currentMedicoId) return;

    setIsLoadingData(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Chamada do serviço
      const response = await slotService.listarSlotsPorMedico(currentMedicoId, hoje);
      
      // 1. Asserção segura: Dizemos que a resposta é desconhecida (unknown) 
      // e depois afirmamos que é um array de SlotResponse.
      // Isso satisfaz o linter sem usar 'any'.
      const rawData = response as unknown as SlotResponse[];

      // 2. Mapeamento seguro
      const data: Slot[] = rawData.map((item) => ({
        id: item.id,
        // Se medicoId vier nulo, usa o do estado
        medicoId: item.medicoId ?? currentMedicoId,
        dataHoraInicio: item.dataHoraInicio,
        dataHoraFim: item.dataHoraFim,
        // Usamos a função auxiliar para garantir o tipo sem 'as any'
        status: parseSlotStatus(item.status),
        valor: item.valor
      }));

      setSlots(data);
      // setActiveTab('form'); // REMOVIDO: Esta linha estava causando o problema de navegação.
    } catch (error) {
      console.error("Erro ao buscar slots", error);
      Swal.fire('Erro', 'Não foi possível carregar a agenda.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [currentMedicoId]);

  useEffect(() => {
    if (activeTab === 'list' && currentMedicoId) {
      fetchSlots();
    }
  }, [fetchSlots, activeTab, currentMedicoId]);

  const handleGenerationSuccess = (medicoIdUtilizado: string) => {
    setCurrentMedicoId(medicoIdUtilizado);
    setActiveTab('list');
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'form' ? styles.active : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Gerar Horários
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
          disabled={!currentMedicoId}
          title={!currentMedicoId ? "Gere uma agenda primeiro para visualizar" : ""}
        >
          Visualizar Agenda
        </button>
      </div>

      <div className={styles.contentArea}>
        {activeTab === 'list' && (
          <>
            <h4 className={styles.infoTitle}>Agenda do Médico ID: {currentMedicoId}</h4>
            {isLoadingData ? (
              <p className={styles.loadingText}>Carregando agenda...</p>
            ) : (
              <SlotListTable slots={slots} onRefresh={fetchSlots} />
            )}
          </>
        )}

        {activeTab === 'form' && (
          <SlotGenerationForm onSuccess={handleGenerationSuccess} />
        )}
      </div>
    </div>
  );
};