import { useState, useEffect } from 'react';
import { useDebounce } from '../../../shared/utils/forPages.utils'; 
import { connectWebSocket, subscribe, unsubscribe } from '../../../shared/services/websocket.service'; 
import type { NotificationEnvelope, ConsultaSummary } from '../types/consulta.types';

// Imports dos Hooks Parciais
import { useConsultaForm } from './partials/useConsultaForm';
import { useConsultaList } from './partials/useConsultaList'; // Importe o arquivo acima

export const useConsulta = (userId: string) => {
  // 1. Estados Locais
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);
  const [error, setError] = useState<string | null>(null); // Adicionei estado de erro pois a página pede
  
  // 2. Instancia os Hooks Filhos
  const form = useConsultaForm(userId);
  const list = useConsultaList(userId);

  // 3. Inicialização
  useEffect(() => {
    // Busca inicial
    list.fetchConsultas(debouncedSearchTerm, 0, true);
    list.fetchSolicitacoes(0, true);
  }, [debouncedSearchTerm]); // Removemos list.fetch... das dependências para evitar loop, ou use useCallback nos filhos
  
  useEffect(() => {
    form.loadInitialOptions();
  }, []);

  // 4. WebSocket
  useEffect(() => {
    if (!userId) return;
    connectWebSocket();
    const topic = `/user/${userId}/queue/consultas`;
    
    const sub = subscribe<NotificationEnvelope<ConsultaSummary>>(topic, (envelope) => {
      console.log("Notificação Recebida:", envelope);
      setConfirmedConsulta(envelope.data);
      list.refreshAll(); 
    });

    return () => { if (sub) unsubscribe(topic); };
  }, [userId]);

  // 5. Submit Integrado
  const handleSubmitIntegrated = async (data: any) => {
    // Se o seu form hook já gerencia os dados internamente, o parametro 'data' pode ser ignorado 
    // ou usado dependendo de como AgendarConsultaPartial envia.
    try {
      await form.submitRequest();
      // Se a requisição for bem-sucedida, atualiza as listas.
      list.refreshAll();
    } catch (e) {
      // Se submitRequest() lançar um erro, ele será capturado aqui.
      // Você pode, opcionalmente, tratar o erro (ex: setError()).
      console.error("Falha ao submeter a consulta:", e);
    }
  };

  // 6. RETORNO COMPATÍVEL COM ConsultaPage.tsx
  return {
    // --- Listas e Paginação (Mapeamento Exato) ---
    consultas: list.consultas,
    isLoadingConsultas: list.isLoadingConsultas,
    hasMoreConsultas: list.hasMoreConsultas, // [CORRIGIDO] Agora existe
    loadMoreConsultas: list.loadMoreConsultas, // [CORRIGIDO] Agora existe

    solicitacoes: list.solicitacoes,
    isLoadingSolicitacoes: list.isLoadingSolicitacoes,
    hasMoreSolicitacoes: list.hasMoreSolicitacoes, // [CORRIGIDO]
    loadMoreSolicitacoes: list.loadMoreSolicitacoes, // [CORRIGIDO]

    // --- Formulário (Renomeando para bater com a Página) ---
    formOptions: form.tiposOptions,    // A página chama de formOptions, o hook chama de tiposOptions
    opcoesHorarios: form.horariosOptions, // A página chama de opcoesHorarios
    isLoadingHorarios: form.isLoadingHorarios,
    buscarHorarios: form.handleTipoChange, // A página chama de buscarHorarios
    handleSubmitConsulta: handleSubmitIntegrated, // A página chama de handleSubmitConsulta
    isSubmitting: form.isSubmitting,

    // --- Feedback ---
    confirmedConsulta,
    closeConfirmationModal: () => setConfirmedConsulta(null),
    error
  };
};