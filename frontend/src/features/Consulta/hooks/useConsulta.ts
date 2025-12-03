import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../../shared/utils/forPages.utils'; 
import { connectWebSocket, subscribe, unsubscribe } from '../../../shared/services/websocket.service'; 
import type { NotificationEnvelope, ConsultaSummary } from '../types/consulta.types';
import { useConsultaForm } from './partials/useConsultaForm';
import { useConsultaList } from './partials/useConsultasConfirmadas';

// Imports dos Hooks Filhos


export const useConsulta = (userId: string) => {
  // 1. Estados de Controle da Página
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);
  
  // 2. Instancia os Hooks Filhos
  const form = useConsultaForm(userId);
  const list = useConsultaList(userId);

  // Extraímos as funções dos hooks filhos para podermos envolvê-las com useCallback.
  const { fetchConsultas, fetchSolicitacoes, refreshAll: refreshAllLists } = list;
  const { loadInitialOptions } = form;

  // 3. Atualização Inicial e Busca
  useEffect(() => {
    fetchConsultas(debouncedSearchTerm, 0);
    fetchSolicitacoes(0);
  }, [debouncedSearchTerm, fetchConsultas, fetchSolicitacoes]);
  
  // Carrega opções do form ao montar
  useEffect(() => {
    loadInitialOptions();
  }, [loadInitialOptions]);

  // 4. WebSocket (Atualização em Tempo Real)
  // Usamos useCallback para garantir que a função de refresh não seja recriada a cada renderização.
  const refreshAll = useCallback(() => refreshAllLists(), [refreshAllLists]);
  useEffect(() => {
    if (!userId) return;
    connectWebSocket();
    const topic = `/user/${userId}/queue/consultas`;
    
    const sub = subscribe<NotificationEnvelope<ConsultaSummary>>(topic, (envelope) => {
      console.log("Notificação Recebida:", envelope);
      setConfirmedConsulta(envelope.data);
      refreshAll(); // Atualiza as listas automaticamente
    });

    return () => {
        if (sub !== undefined) unsubscribe(topic);
    };
  }, [userId, refreshAll]);

  // 5. Submit Integrado (Form -> Lista)
  const handleSubmitIntegrated = async () => {
    const success = await form.submitRequest();
    if (success) {
        refreshAll(); // Recarrega a fila de solicitações
    }
  };

  // 6. Retorno Unificado
  return {
    // --- Dados de Lista ---
    consultas: list.consultas,
    solicitacoes: list.solicitacoes,
    isLoadingConsultas: list.isLoadingConsultas,
    refreshLists: refreshAll,

    // --- Dados do Formulário ---
    tiposOptions: form.tiposOptions,
    horariosOptions: form.horariosOptions,
    isLoadingHorarios: form.isLoadingHorarios,
    isSubmitting: form.isSubmitting,
    
    // --- Controles do Formulário ---
    selectedTipo: form.selectedTipo,
    selectedSlot: form.selectedSlot,
    sintomas: form.sintomas,
    setSintomas: form.setSintomas,
    handleTipoChange: form.handleTipoChange,
    handleSlotChange: form.handleSlotChange,
    handleSubmit: handleSubmitIntegrated, 

    // --- Controles Gerais ---
    confirmedConsulta,
    closeModal: () => setConfirmedConsulta(null),
    searchTerm,
    setSearchTerm
  };
};