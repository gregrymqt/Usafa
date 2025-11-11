import { useState, useEffect, useCallback } from 'react';
import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';

export const useConsulta = (userId: string) => {
  // Estado Parte 1: Tabela de Consultas
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true);

  // Estado Parte 2: Formulário de Requisição
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado Parte 3: Modal de Sucesso e Mensagem
  const [submittedRequest, setSubmittedRequest] = useState<ConsultaSummary | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Erros
  const [error, setError] = useState<string | null>(null);

  // Busca inicial (Tabela e Opções do Form)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingConsultas(true);
        // Busca os dados da tabela
        const consultasData = await getConsultas(userId);
        setConsultas(consultasData);
        
        // Busca os dados dos <select>
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
  }, [userId]);

  // Função para o formulário chamar ao enviar
  const handleSubmitConsulta = async (request: ConsultaRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const summary = await requestConsulta(request);
      setSubmittedRequest(summary); // Mostra o modal de sucesso
    } catch (err) {
      if(err instanceof Error)
           setError(err.message);
        else
           setError('Falha ao carregar dados da página.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para o modal chamar ao fechar
  const closeSummaryModal = useCallback(() => {
    setSubmittedRequest(null);
    setShowSuccessMessage(true); // Mostra a mensagem "Iremos entrar em contato..."
    
    // Esconde a mensagem após alguns segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  }, []);

  return {
    // Para a Tabela
    consultas,
    isLoadingConsultas,
    // Para o Formulário
    formOptions,
    isSubmitting,
    handleSubmitConsulta,
    // Para o Modal e Mensagem
    submittedRequest,
    showSuccessMessage,
    closeSummaryModal,
    // Erro
    error
  };
};