// (Caminho: ../hooks/useConsulta.ts)

import { useState, useEffect } from 'react';
import {
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';

export const useConsulta = (userId: string) => {
  // Estado Parte 1 e 2 (Sem mudanças)
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true);
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MANTIDO: Esta será nossa única confirmação
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

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
    error
  };
};