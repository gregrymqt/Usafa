import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { consultaService } from "../../services/consulta.service";
import type {
  FormSelectOption,
  ConsultaRequest,
  AppointmentUserResponse,
} from "../../types/consulta.types";
import { ApiError } from "../../../../shared";
import { ApiErrorResponse } from "../../../../shared/exceptions/types/ApiErrorResponse";

export const useConsultaForm = (userId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tiposOptions, setTiposOptions] = useState<FormSelectOption[]>([]);
  const [horariosOptions, setHorariosOptions] = useState<FormSelectOption[]>(
    []
  );
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

  const submitRequest = async (
    data: ConsultaRequest
  ): Promise<AppointmentUserResponse | null> => {
    if (!selectedSlot) {
      Swal.fire("Atenção", "Selecione um Horário/Médico.", "warning");
      return null;
    }

    setIsSubmitting(true);
    try {
      const payload: ConsultaRequest = {
        patientId: data.patientId || userId,
        tipoConsultaId: data.tipoConsultaId || selectedTipo,
        horarioSlotId: data.horarioSlotId || selectedSlot,
        sintomas: data.sintomas || sintomas,
      };

      // Recebe o objeto criado do backend
      const novaConsulta = await consultaService.requestConsulta(payload);

      Swal.fire(
        "Sucesso",
        `Agendamento confirmado para dia ${novaConsulta.data} às ${novaConsulta.horario}!`,
        "success"
      );

      // Limpa campos
      setSelectedSlot("");
      setSintomas("");

      return novaConsulta; // Retorna o objeto para quem chamou
    } catch (error: unknown) {
      // 1. Mude 'any' para 'unknown'
      console.error(error);

      let msg = "Não foi possível agendar.";

      // 2. Verifica se o erro já é uma instância da sua classe ApiError
      if (error instanceof ApiError) {
        msg = error.originalMessage;
      }
      // 3. Caso seja um erro bruto do Axios/Fetch (verifica se tem response.data)
      else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        // Fazemos um 'type assertion' seguro agora que sabemos que é um objeto
        const err = error as { response: { data: ApiErrorResponse } };

        if (err.response?.data?.message) {
          msg = err.response.data.message;
        }
      }
      // 4. Caso seja um erro genérico do JS (Error)
      else if (error instanceof Error) {
        msg = error.message;
      }

      Swal.fire("Erro", msg, "error");
      return null;
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
