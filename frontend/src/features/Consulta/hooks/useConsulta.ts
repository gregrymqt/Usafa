import { useState, useEffect, useCallback } from 'react';
import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary,
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';
import {
  connectWebSocket,
  subscribe,
  unsubscribe,
} from '../../../shared/services/websocket.service';
import { useDebounce } from '../../../shared/utils/forPages.utils';

export const useConsulta = (userId: string) => {
  // --- Estados [cite: 3-5] ---
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true); 
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);
  
  // --- Lógica de Busca e Paginação ---
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchConsultas = useCallback(async (search: string, pageNumber: number, isNewSearch = false) => {
    setIsLoadingConsultas(true);
    setError(null);
    try {
      // Assumindo que getConsultas será atualizado para aceitar paginação e busca
      const consultasData = await getConsultas(userId, { page: pageNumber, size: 10, search });
      setConsultas(prev => isNewSearch ? consultasData.content : [...prev, ...consultasData.content]);
      setHasMore(!consultasData.last);
      setPage(pageNumber);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Falha ao carregar suas consultas.');
    } finally {
      setIsLoadingConsultas(false);
    }
  }, [userId]);

  // --- useEffect (Carregamento e WebSocket) [cite: 6-10] ---
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        const optionsData = await getFormOptions();
        setFormOptions(optionsData);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Falha ao carregar dados da página.');
      } finally {
        setIsLoadingConsultas(false);
      }
    };
    loadInitialOptions();

    connectWebSocket();
    const topic = `/user/${userId}/queue/consultas`;
    const onConfirmationReceived = (summary: ConsultaSummary) => {
      setConfirmedConsulta(summary);
      // Opcional: Recarregar a lista quando receber confirmação
      fetchConsultas(debouncedSearchTerm, 0, true);
    };

    subscribe<ConsultaSummary>(topic, onConfirmationReceived);
    return () => {
      unsubscribe(topic);
    };
  }, [userId, debouncedSearchTerm, fetchConsultas]);

  // Efeito para buscar consultas quando o termo de busca muda
  useEffect(() => {
    fetchConsultas(debouncedSearchTerm, 0, true);
  }, [debouncedSearchTerm, fetchConsultas]);

  // --- Manipulador de Envio ATUALIZADO [cite: 11] ---
  // Recebe Partial porque o form não manda o patientId
  const handleSubmitConsulta = async (partialRequest: Partial<ConsultaRequest>) => {
    try {
      setIsSubmitting(true);
      setError(null); 

      // MONTAGEM DO DTO COMPLETO
      const fullRequest: ConsultaRequest = {
        patientId: userId, // Injetamos o ID do usuário aqui [cite: 3]
        tipoConsultaId: partialRequest.tipoConsultaId!,
        horarioSlotId: Number(partialRequest.horarioSlotId!),
        sintomas: partialRequest.sintomas || ''
      };

      await requestConsulta(fullRequest);

      setShowSuccessMessage(true); 
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      // Recarregar dados para atualizar lista de consultas e remover slot ocupado da lista
      const updatedOptions = await getFormOptions();
      setFormOptions(updatedOptions);
      fetchConsultas(searchTerm, 0, true); // Recarrega a lista de consultas

    } catch (err) { 
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao realizar agendamento.'); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  const loadMoreConsultas = useCallback(() => {
    if (!isLoadingConsultas && hasMore) {
      fetchConsultas(debouncedSearchTerm, page + 1);
    }
  }, [isLoadingConsultas, hasMore, debouncedSearchTerm, page, fetchConsultas]);

  const closeConfirmationModal = useCallback(() => { 
    setConfirmedConsulta(null);
  }, []);

  return { 
    consultas,
    isLoadingConsultas,
    formOptions,
    isSubmitting,
    showSuccessMessage,
    confirmedConsulta,
    error,
    searchTerm,
    setSearchTerm,
    hasMore,
    loadMoreConsultas,
    handleSubmitConsulta,
    closeConfirmationModal,
    refetchConsultas: () => fetchConsultas(debouncedSearchTerm, 0, true),
  };
};