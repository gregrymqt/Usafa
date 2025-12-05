import { useState, useEffect } from 'react';
import { useDebounce } from '../../../../shared/utils/forPages.utils';
import { AppointmentUserResponse, ConsultaRequest } from '../../types/consulta.types';
import { useConsultaForm } from './useConsultaForm'; // Ajuste o caminho se estiver em ./partials/
import { useConsultaList } from './useConsultaList'; // Ajuste o caminho se estiver em ./partials/

export const useConsulta = (userId: string) => {
  // 1. Estados Locais
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  // Mantemos o estado para compatibilidade com a UI, mas ele iniciará null
  const [confirmedConsulta, setConfirmedConsulta] = useState<AppointmentUserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2. Instancia os Hooks Filhos
  const form = useConsultaForm(userId);
  const list = useConsultaList(userId);

  // 3. Efeito de Busca (Search)
  useEffect(() => {
    list.fetchConsultas(debouncedSearchTerm, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); 

  // 4. Carregar Opções Iniciais
  useEffect(() => {
    form.loadInitialOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- WEBSOCKET REMOVIDO ---

  // 6. Submit Integrado
  const handleSubmitIntegrated = async (data: ConsultaRequest) => {
    setError(null);
    try {
      const success = await form.submitRequest(data);
      if (success) {
        // Atualiza a lista manualmente após o envio bem-sucedido
        list.refreshAll();
      }
    } catch (e) {
      console.error("Falha ao submeter:", e);
      setError("Ocorreu um erro ao processar sua solicitação.");
    }
  };

  // 7. Retorno Unificado
  return {
    // --- Listas ---
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
    setSearchTerm,

    // --- Formulário ---
    formOptions: { 
        medicos: [], 
        tipos: form.tiposOptions,
        horarios: form.horariosOptions
    },
    tiposOptions: form.tiposOptions,
    opcoesHorarios: form.horariosOptions,
    isLoadingHorarios: form.isLoadingHorarios,
    buscarHorarios: form.handleTipoChange,
    
    handleSubmitConsulta: handleSubmitIntegrated,
    isSubmitting: form.isSubmitting,
    handleSlotChange: form.handleSlotChange,

    // --- Feedback ---
    confirmedConsulta,
    closeConfirmationModal: () => setConfirmedConsulta(null),
    error,
    refreshAll: list.refreshAll
  };
};