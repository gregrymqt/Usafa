import { useState, useEffect } from "react";
import { useDebounce } from "../../../shared/utils/forPages.utils";
import { SolicitacaoSummary, NotificationEnvelope, ConsultaRequest } from "../types/consulta.types";
import { useConsultaForm } from "./partials/useConsultaForm";
import { useConsultaList } from "./partials/useConsultaList";
import { subscribe, unsubscribe } from "../../../shared/services/websocket.service";

export const useConsulta = (userId: string) => {
  // 1. Estados Locais
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // Sintaxe correta do use-debounce
  const [confirmedConsulta, setConfirmedConsulta] = useState<SolicitacaoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2. Instancia os Hooks Filhos
  const form = useConsultaForm(userId);
  const list = useConsultaList(userId);

  // 3. Efeito de Busca (Search)
  // Quando o termo de busca muda, recarrega a lista de consultas
  useEffect(() => {
    // Agora o TS não vai reclamar, pois exportamos fetchConsultas no passo 1
    list.fetchConsultas(debouncedSearchTerm, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); 
  // Nota: Não incluímos 'list' aqui para evitar loops infinitos, 
  // pois 'list' muda a cada render se não for memorizado no hook filho.

  // 4. Carregar Opções Iniciais do Formulário
  useEffect(() => {
    form.loadInitialOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. WebSocket
  useEffect(() => {
    if (!userId) return;
    
    // connectWebSocket(); // Descomente se precisar iniciar a conexão aqui
    const topic = `/user/${userId}/queue/consultas`;
    
    const sub = subscribe<NotificationEnvelope<SolicitacaoSummary>>(topic, (envelope) => {
      console.log("Notificação Recebida:", envelope);
      if (envelope.data) {
        setConfirmedConsulta(envelope.data);
        list.refreshAll(); 
      }
    });

    return () => { if (sub != undefined) { unsubscribe(topic); } };
  }, [userId, list.refreshAll]); // Adicionado refreshAll nas dependências

  // 6. Submit Integrado
  const handleSubmitIntegrated = async (data: ConsultaRequest) => {
    setError(null); // Limpa erros anteriores
    try {
      // O hook do form processa o envio
      const success = await form.submitRequest(data);
      
      if (success) {
        // Se deu certo, atualiza as listas para mostrar a nova solicitação/consulta
        list.refreshAll();
      }
    } catch (e) {
      console.error("Falha ao submeter a consulta:", e);
      setError("Ocorreu um erro ao processar sua solicitação.");
    }
  };

  // 7. Retorno Unificado
  return {
    // --- Listas e Paginação ---
    consultas: list.consultas,
    isLoadingConsultas: list.isLoadingConsultas,
    hasMoreConsultas: list.hasMoreConsultas,
    loadMoreConsultas: list.loadMoreConsultas,

    solicitacoes: list.solicitacoes,
    isLoadingSolicitacoes: list.isLoadingSolicitacoes,
    hasMoreSolicitacoes: list.hasMoreSolicitacoes,
    loadMoreSolicitacoes: list.loadMoreSolicitacoes,

    // --- Busca ---
    searchTerm,
    setSearchTerm, // Exportado para usar no Input de busca da página

    // --- Formulário ---
    formOptions: { // Agrupado para bater com a interface esperada se necessário
        medicos: [], // Se precisar preencher
        tipos: form.tiposOptions,
        horarios: form.horariosOptions
    },
    // Ou exporte direto como estava, mas garanta que a Page saiba lidar:
    tiposOptions: form.tiposOptions, 
    opcoesHorarios: form.horariosOptions,
    isLoadingHorarios: form.isLoadingHorarios,
    buscarHorarios: form.handleTipoChange,
    
    handleSubmitConsulta: handleSubmitIntegrated,
    isSubmitting: form.isSubmitting,

    // --- Feedback ---
    confirmedConsulta,
    closeConfirmationModal: () => setConfirmedConsulta(null),
    error,
    refreshAll: list.refreshAll // Expondo refreshAll para uso externo
  };
};