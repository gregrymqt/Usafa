// (Caminho: ../hooks/useConsulta.ts)

import { useState, useEffect, useCallback } from 'react';
import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary,
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';
import { connectWebSocket, disconnectWebSocket } from '../../../shared/services/websocket.service'; // Ajuste o caminho

export const useConsulta = (userId: string) => {
  // Estado Parte 1 e 2 (Sem mudanças)
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true);
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MANTIDO: Esta será nossa única confirmação
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);
  
  // useEffect (Sem mudanças)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingConsultas(true);
        const consultasData = await getConsultas(userId);
        setConsultas(consultasData);
        
        const optionsData = await getFormOptions();
        setFormOptions(optionsData);
      } catch (err) {
        if(err instanceof Error)
           setError(err.message);
        else
           setError('Falha ao carregar dados da página.');
      } finally {
        setIsLoadingConsultas(false);
      }
    };
    loadData();

    // 2. Conecta ao WebSocket
    // Passamos a função 'setConfirmedConsulta' como callback.
    // Quando o WebSocket receber uma mensagem, ele vai chamar
    // setConfirmedConsulta(summary)
    connectWebSocket(userId, (summary) => {
      setConfirmedConsulta(summary);
    });

    // 3. Desconecta ao sair do componente
    return () => {
      disconnectWebSocket();
    };
  }, [userId]);

  // --- MUDANÇAS AQUI ---
  // Função para o formulário chamar ao enviar
  const handleSubmitConsulta = async (request: ConsultaRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 1. Chama o serviço atualizado (que não retorna nada)
      await requestConsulta(request);
      
      // 3. ATIVA a mensagem de sucesso IMEDIATAMENTE
      setShowSuccessMessage(true);
      
      // 4. Esconde a mensagem após 5 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

    } catch (err) {
      if(err instanceof Error)
           setError(err.message);
      else
           setError('Falha ao carregar dados da página.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar o NOVO modal de confirmação
  const closeConfirmationModal = useCallback(() => {
    setConfirmedConsulta(null);
    // (Opcional: Atualizar a tabela de consultas aqui)
  }, []);

  return {
    // Para a Tabela
    consultas,
    isLoadingConsultas,
    // Para o Formulário
    formOptions,
    isSubmitting,
    handleSubmitConsulta,
    //Modal
    showSuccessMessage,
    confirmedConsulta,
    closeConfirmationModal,
    // Erro
    error
  };
};