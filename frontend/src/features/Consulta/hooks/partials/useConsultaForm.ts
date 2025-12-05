import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service';
import type { FormSelectOption, ConsultaRequest } from '../../types/consulta.types';

export const useConsultaForm = (userId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [tiposOptions, setTiposOptions] = useState<FormSelectOption[]>([]);
  const [horariosOptions, setHorariosOptions] = useState<FormSelectOption[]>([]);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);

  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sintomas, setSintomas] = useState("");

  // Carrega Médicos/Tipos iniciais
  const loadInitialOptions = useCallback(async () => {
    try {
      setIsLoadingHorarios(true);
      const data = await consultaService.getFormOptions();
      // Filtra labels vazios para segurança
      const tiposValidos = (data.tipos || []).filter((t) => t.value && t.label);
      setTiposOptions(tiposValidos);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingHorarios(false);
    }
  }, []);

  // Ao mudar o tipo, busca os slots (horários/médicos) disponíveis
  const handleTipoChange = useCallback(async (tipoId: string) => {
    setSelectedTipo(tipoId);
    setSelectedSlot("");
    setHorariosOptions([]);

    if (tipoId) {
      const slots = await consultaService.getHorariosPorTipo(tipoId);
      setHorariosOptions(slots);
    }
  }, []);

  const submitRequest = async (data: ConsultaRequest): Promise<boolean> => {
    if (!selectedSlot) {
      Swal.fire("Atenção", "Selecione um Horário/Médico.", "warning");
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload: ConsultaRequest = {
        patientId: data.patientId || userId, 
        tipoConsultaId: data.tipoConsultaId || selectedTipo,
        horarioSlotId: data.horarioSlotId || selectedSlot, 
        sintomas: data.sintomas || sintomas,
      };

      await consultaService.requestConsulta(payload);
      Swal.fire("Sucesso", "Solicitação enviada!", "success");

      // Limpa campos após sucesso
      setSelectedSlot("");
      setSintomas("");
      return true;
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Não foi possível agendar.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    tiposOptions,
    horariosOptions,
    selectedTipo,
    selectedSlot,
    sintomas,
    isLoadingHorarios,
    setSintomas,
    loadInitialOptions,
    handleTipoChange,
    handleSlotChange: setSelectedSlot,
    submitRequest,
  };
};