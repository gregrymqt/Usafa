// hooks/partials/useConsultaForm.ts
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { getFormOptions, getHorariosPorTipo, requestConsulta } from '../../services/consulta.service';
import { ConsultaFormOptions, FormSelectOption, ConsultaRequest } from '../../types/consulta.types';
import { ApiError } from '../../../../shared';

export const useConsultaForm = (userId: string) => {
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [opcoesHorarios, setOpcoesHorarios] = useState<FormSelectOption[]>([]);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega opções iniciais
  useEffect(() => {
    if (userId) {
      getFormOptions()
        .then(setFormOptions)
        .catch((error: unknown) => {
          console.error(error);
          const mensagemDoBackend =
            error instanceof ApiError ? error.message : "Falha ao carregar opções do formulário.";
          Swal.fire("Erro", mensagemDoBackend, "error");
        });
    }
  }, [userId]);

  // Busca horários quando o tipo muda
  const buscarHorarios = useCallback(async (tipoId: string) => {
    if (!tipoId) {
      setOpcoesHorarios([]);
      return;
    }
    setIsLoadingHorarios(true);
    try {
      const horarios = await getHorariosPorTipo(tipoId);
      setOpcoesHorarios(horarios);
    } catch (error: unknown) {
      console.error(error);
      const mensagemDoBackend =
        error instanceof ApiError ? error.message : "Falha ao buscar horários disponíveis.";
      Swal.fire("Erro", mensagemDoBackend, "error");
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
        horarioSlotId: Number(partialRequest.horarioSlotId!),
        sintomas: partialRequest.sintomas || ''
      };

      await requestConsulta(fullRequest);

      Swal.fire('Sucesso!', 'Sua solicitação de consulta foi enviada.', 'success');

      // Atualiza opções para remover horário usado
      getFormOptions().then(setFormOptions);

      return true; // Sucesso
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Erro ao realizar agendamento.';
      setError(errorMessage);
      Swal.fire('Erro', errorMessage, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    formOptions, 
    opcoesHorarios, 
    isLoadingHorarios, 
    isSubmitting, 
    error, 
    buscarHorarios, 
    submitRequest,
    setError // Exportado para limpar erro externamente se precisar
  };
};