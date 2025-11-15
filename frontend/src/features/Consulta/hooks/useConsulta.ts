import { useState, useEffect, useCallback } from 'react';
import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary,
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';
// 1. IMPORTAÇÕES DO WEBSOCKET ATUALIZADAS
import {
  connectWebSocket,
  subscribe,
  unsubscribe,
} from '../../../shared/services/websocket.service';

export const useConsulta = (userId: string) => {
  // --- Estados (Sem mudanças) ---
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true); 
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null); 

  // --- useEffect (Atualizado para o novo WebSocket) ---
  useEffect(() => {
    // 1. Carrega dados da API (Sem mudanças)
    const loadData = async () => {
      try {
        setIsLoadingConsultas(true);
        const consultasData = await getConsultas(userId);
        setConsultas(consultasData);

        const optionsData = await getFormOptions();
        setFormOptions(optionsData);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Falha ao carregar dados da página.');
      } finally {
        setIsLoadingConsultas(false);
      }
    };
    loadData();

    // --- LÓGICA DO WEBSOCKET ATUALIZADA ---

    // 2. Garante que o cliente WebSocket esteja ativo
    connectWebSocket();

    // 3. Define o tópico e o callback
    const topic = `/user/${userId}/queue/consultas`;
    const onConfirmationReceived = (summary: ConsultaSummary) => {
      setConfirmedConsulta(summary);
    };

    // 4. Inscreve-se no tópico
    subscribe<ConsultaSummary>(topic, onConfirmationReceived);

    // 5. Limpa a inscrição (unsubscribe) ao sair do componente
    return () => {
      unsubscribe(topic);
      // Não chamamos disconnectWebSocket() aqui,
      // pois outros componentes podem estar usando.
    };
  }, [userId]);

  // --- Manipulador de Envio (Sem mudanças) ---
  const handleSubmitConsulta = async (request: ConsultaRequest) => {
    try {
      setIsSubmitting(true);
      setError(null); 

      await requestConsulta(request);

      setShowSuccessMessage(true); 
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000); 
    } catch (err) { 
      if (err instanceof Error) setError(err.message);
      else setError('Falha ao carregar dados da página.'); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  // --- Fechar Modal (Sem mudanças) ---
  const closeConfirmationModal = useCallback(() => { 
    setConfirmedConsulta(null);
  }, []);

  // --- Retorno (Sem mudanças) ---
  return { 
    consultas,
    isLoadingConsultas,
    formOptions,
    isSubmitting,
    handleSubmitConsulta,
    showSuccessMessage,
    confirmedConsulta,
    closeConfirmationModal,
    error,
  };
};