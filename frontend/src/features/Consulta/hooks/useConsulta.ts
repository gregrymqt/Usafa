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

export const useConsulta = (userId: string) => {
  // --- Estados [cite: 3-5] ---
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true); 
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);

  // --- useEffect (Carregamento e WebSocket) [cite: 6-10] ---
  useEffect(() => {
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

    connectWebSocket();
    const topic = `/user/${userId}/queue/consultas`;
    const onConfirmationReceived = (summary: ConsultaSummary) => {
      setConfirmedConsulta(summary);
      // Opcional: Recarregar a lista quando receber confirmação
      loadData(); 
    };

    subscribe<ConsultaSummary>(topic, onConfirmationReceived);
    return () => {
      unsubscribe(topic);
    };
  }, [userId]);

  // --- Manipulador de Envio ATUALIZADO [cite: 11] ---
  // Recebe Partial porque o form não manda o patientId
  const handleSubmitConsulta = async (partialRequest:  Partial<ConsultaRequest>) => {
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
      const updatedConsultas = await getConsultas(userId);
      setConsultas(updatedConsultas);
      const updatedOptions = await getFormOptions();
      setFormOptions(updatedOptions);

    } catch (err) { 
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao realizar agendamento.'); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  const closeConfirmationModal = useCallback(() => { 
    setConfirmedConsulta(null);
  }, []);

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