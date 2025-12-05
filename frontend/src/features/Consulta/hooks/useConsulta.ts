import { useState, useEffect } from 'react';
// Hooks parciais
import { useConsultaList } from './partials/useConsultaList';
import { useConsultaForm } from './partials/useConsultaForm';
// Tipos
import type { AppointmentUserResponse, ConsultaRequest } from '../types/consulta.types';
import { useDebounce } from '../../../shared/utils/forPages.utils';

export const useConsulta = (userId: string) => {
  // 1. Estados Locais
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  // Alterado para AppointmentUserResponse | null
  // Como removemos o socket, isso só será preenchido se você fizer alguma lógica manual
  // ou pode ser removido se não for usar feedback visual de confirmação automática.
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
        // Atualiza a lista manualmente após o envio
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
    consultas: list.consultas, // Agora é AppointmentUserResponse[]
    isLoadingConsultas: list.isLoadingConsultas,
    hasMoreConsultas: list.hasMoreConsultas,
    loadMoreConsultas: list.loadMoreConsultas,

    solicitacoes: list.solicitacoes, // Agora é AppointmentUserResponse[]
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