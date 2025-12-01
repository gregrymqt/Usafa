// hooks/partials/useConsultaForm.ts
import { useState, useEffect, useCallback } from 'react';
import { getFormOptions, getHorariosPorTipo, requestConsulta } from '../../services/consulta.service';
import { ConsultaFormOptions, FormSelectOption, ConsultaRequest } from '../../types/consulta.types';

export const useConsultaForm = (userId: string) => {
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [opcoesHorarios, setOpcoesHorarios] = useState<FormSelectOption[]>([]); // [cite: 6]
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false); // [cite: 7]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // [cite: 5]

  // Carrega opções iniciais
  useEffect(() => {
    if (userId) {
      getFormOptions().then(setFormOptions).catch(console.error);
    }
  }, [userId]); // [cite: 17]

  // Busca horários quando o tipo muda
  const buscarHorarios = useCallback(async (tipoId: string) => {
    if (!tipoId) {
      setOpcoesHorarios([]);
      return;
    }
    setIsLoadingHorarios(true);
    try {
      const horarios = await getHorariosPorTipo(tipoId);
      setOpcoesHorarios(horarios); // [cite: 16]
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHorarios(false);
    }
  }, []);

  const submitRequest = async (partialRequest: Partial<ConsultaRequest>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const fullRequest: ConsultaRequest = {
        patientId: userId,
        tipoConsultaId: partialRequest.tipoConsultaId!,
        horarioSlotId: Number(partialRequest.horarioSlotId!), // ID do slot
        sintomas: partialRequest.sintomas || '' // [cite: 27]
      };

      await requestConsulta(fullRequest); // [cite: 27]
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Atualiza opções para remover horário usado
      getFormOptions().then(setFormOptions); // [cite: 28]
      
      return true; // Sucesso
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao realizar agendamento.'); // [cite: 30]
      return false;
    } finally {
      setIsSubmitting(false); // [cite: 31]
    }
  };

  return { 
    formOptions, 
    opcoesHorarios, 
    isLoadingHorarios, 
    isSubmitting, 
    error, 
    showSuccessMessage, 
    buscarHorarios, 
    submitRequest,
    setError // Exportado para limpar erro externamente se precisar
  };
};