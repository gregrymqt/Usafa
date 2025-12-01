// hooks/useConsulta.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../../../shared/utils/forPages.utils'; // [cite: 3]
import { connectWebSocket, subscribe, unsubscribe } from '../../../shared/services/websocket.service'; // [cite: 2]
import type { NotificationEnvelope, ConsultaSummary, ConsultaRequest } from '../types/consulta.types';

// Import dos Partials
import { useConsultasConfirmadas } from './partials/useConsultasConfirmadas';
import { useSolicitacoes } from './partials/useSolicitacoes';
import { useConsultaForm } from './partials/useConsultaForm';

export const useConsulta = (userId: string) => {
  // 1. Estados de Busca Global
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // [cite: 9]
  const searchTermRef = useRef(debouncedSearchTerm);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);

  // 2. Uso dos Hooks Parciais
  const sql = useConsultasConfirmadas(userId);
  const mongo = useSolicitacoes(userId);
  const form = useConsultaForm(userId);

  // 3. Efeitos de Busca
  useEffect(() => {
    searchTermRef.current = debouncedSearchTerm; // [cite: 11]
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (userId) {
      // Busca SQL (filtra pelo termo)
      sql.fetchConsultas(debouncedSearchTerm, 0, true);
      // Busca Mongo (sem filtro de texto complexo por enquanto)
      mongo.fetchSolicitacoes(0, true);
    }
  }, [debouncedSearchTerm, userId]);

  // 4. Lógica WebSocket (Real-time)
  const setupWebSocketListener = useCallback(() => {
    console.log("Iniciando WebSocket...");
    connectWebSocket(); // 
    
    const topic = `/user/${userId}/queue/consultas`;
    
    subscribe<NotificationEnvelope<ConsultaSummary>>(topic, (envelope) => {
      console.log("Notificação recebida:", envelope.message); // [cite: 21]
      setConfirmedConsulta(envelope.data);
      
      // Atualiza ambas as listas quando chega novidade
      sql.fetchConsultas(searchTermRef.current, 0, true); // [cite: 22]
      mongo.fetchSolicitacoes(0, true); // Atualiza também as solicitações (status mudou)
    });
  }, [userId, sql, mongo]);

  // 5. Submit Integrado (Socket + Form)
  const handleSubmitConsulta = async (data: Partial<ConsultaRequest>) => {
    // A) Inicia escuta ANTES de enviar [cite: 26]
    setupWebSocketListener();

    // B) Envia formulário
    const success = await form.submitRequest(data);
    
    // C) Se deu certo, atualiza a lista de Solicitações imediatamente (feedback visual "Pendente")
    if (success) {
       mongo.fetchSolicitacoes(0, true);
    }
  };

  const closeConfirmationModal = () => {
    setConfirmedConsulta(null);
    unsubscribe(`/user/${userId}/queue/consultas`); // [cite: 33]
  };

  // 6. Retorno Unificado
  return {
    // Dados SQL
    consultas: sql.consultas,
    isLoadingConsultas: sql.isLoading,
    hasMoreConsultas: sql.hasMore,
    loadMoreConsultas: () => sql.loadMore(debouncedSearchTerm),

    // Dados Mongo (Novo)
    solicitacoes: mongo.solicitacoes,
    isLoadingSolicitacoes: mongo.isLoading,
    hasMoreSolicitacoes: mongo.hasMore,
    loadMoreSolicitacoes: mongo.loadMore,

    // Formulário
    formOptions: form.formOptions,
    opcoesHorarios: form.opcoesHorarios,
    isLoadingHorarios: form.isLoadingHorarios,
    isSubmitting: form.isSubmitting,
    showSuccessMessage: form.showSuccessMessage,
    error: form.error,
    buscarHorarios: form.buscarHorarios,
    handleSubmitConsulta, // Versão integrada

    // Feedback Real-time
    confirmedConsulta,
    closeConfirmationModal,

    // Busca
    searchTerm,
    setSearchTerm,
    
    // Útil para botão de refresh manual
    refetchAll: () => {
      sql.fetchConsultas(debouncedSearchTerm, 0, true);
      mongo.fetchSolicitacoes(0, true);
    }
  };
};