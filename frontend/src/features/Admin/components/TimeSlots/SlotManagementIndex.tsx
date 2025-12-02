import React, { useState, useEffect, useCallback } from 'react';
import styles from './SlotManagement.module.scss';

// Import dos Components Filhos

// Import do Service para buscar os dados
import Swal from 'sweetalert2';
import { SlotGenerationForm } from './components/Form/SlotGenerationForm';
import { SlotListTable } from './components/Table/SlotListTable';
import { slotService } from './services/slot.service';

interface SlotManagementIndexProps {
  medicoId: string; // Precisamos saber de qual médico estamos cuidando
}

type TabType = 'list' | 'form';

export const SlotManagementIndex: React.FC<SlotManagementIndexProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list'); // Começa listando
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // --- Função para buscar dados da API ---
  const fetchSlots = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Aqui assumimos que você quer ver a agenda de HOJE ou futura. 
      // Em um cenário real, você poderia ter um filtro de data na tela.
      const hoje = new Date().toISOString().split('T')[0]; 
      
      const data = await slotService.listarSlotsPorMedico(medicoId, hoje);
      setSlots(data || []);
    } catch (error) {
      console.error("Erro ao buscar slots", error);
      Swal.fire('Erro', 'Não foi possível carregar a agenda.', 'error');
    } finally {
      setIsLoadingData(false);
    }
  }, [medicoId]);

  // Carrega dados ao abrir a tela
  useEffect(() => {
    if (activeTab === 'list') {
      fetchSlots();
    }
  }, [fetchSlots, activeTab]);

  // --- Handler: Quando o formulário termina de gerar ---
  const handleGenerationSuccess = () => {
    // 1. Muda para a aba de lista automaticamente
    setActiveTab('list');
    // 2. Recarrega os dados para mostrar os novos slots
    fetchSlots();
  };

  return (
    <div className={styles.container}>
      {/* 1. Cabeçalho de Abas */}
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Visualizar Agenda
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'form' ? styles.active : ''}`}
          onClick={() => setActiveTab('form')}
        >
          Gerar Horários
        </button>
      </div>

      {/* 2. Área de Conteúdo Dinâmico */}
      <div className={styles.contentArea}>
        
        {activeTab === 'list' && (
          <>
            {isLoadingData ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Carregando agenda...</p>
            ) : (
              <SlotListTable 
                slots={slots} 
                onRefresh={fetchSlots} 
              />
            )}
          </>
        )}

        {activeTab === 'form' && (
          <SlotGenerationForm 
            medicoId={medicoId} 
            onSuccess={handleGenerationSuccess} 
          />
        )}

      </div>
    </div>
  );
};