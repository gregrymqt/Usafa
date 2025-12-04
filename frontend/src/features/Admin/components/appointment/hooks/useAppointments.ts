import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { ApiError } from "../../../../../shared";
import type {
  AppointmentFormData,
  FormSelectOption,
  ConsultaFormOptionsResponse
} from "../types/appointment.type";
// Importamos a interface correta que vem do service
import { SolicitacaoSummary } from "../../../../Consulta/types/consulta.types"; 
import { useDebounce } from "../../../../../shared/utils/forPages.utils";
import { appointmentService } from "../services/appointment.service";

export const useAppointments = () => {
  // --- Estados Principais ---
  // Alterado de Appointment[] para SolicitacaoSummary[] para bater com o retorno da API
  const [appointments, setAppointments] = useState<SolicitacaoSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Paginação ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // --- Estados para o Formulário ---
  const [typeOptions, setTypeOptions] = useState<FormSelectOption[]>([]);
  const [slotOptions, setSlotOptions] = useState<FormSelectOption[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 1. Carregar Agendamentos (Listagem)
  const fetchAppointments = useCallback(
    async (search: string, pageNumber: number, isNewSearch = false) => {
      setIsLoading(true);
      setError(null);
      try {
        // O service retorna Page<SolicitacaoSummary> 
        const response = await appointmentService.getAllAppointments({
          page: pageNumber,
          size: 10,
          search,
        });

        setAppointments((prev) =>
          isNewSearch 
            ? response.content 
            : [...prev, ...response.content]
        );
        setHasMore(!response.last);
        setPage(pageNumber);
      } catch (error: unknown) {
        const mensagemDoBackend =
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar as consultas.";

        Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
        setError(mensagemDoBackend);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2. Carregar Opções Iniciais
  const loadInitialOptions = useCallback(async () => {
    try {
      const data: ConsultaFormOptionsResponse = await appointmentService.getFormOptions();
      setTypeOptions(data.tipos || []);
    } catch (error: unknown) {
      console.error("Erro ao carregar opções do formulário", error);
    }
  }, []);

  // 3. Buscar Slots dinamicamente
  const fetchSlotsForType = useCallback(async (tipoId: string) => {
    if (!tipoId) {
      setSlotOptions([]);
      return;
    }

    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getHorariosPorTipo(tipoId);
      const slotsFormatados = slots.map((slot) => ({
        ...slot,
        value: String(slot.value),
      }));

      setSlotOptions(slotsFormatados);
    } catch (error: unknown) {
      console.error("Erro ao buscar horários", error);
      Swal.fire("Atenção", "Não há horários disponíveis para esta especialidade.", "info");
      setSlotOptions([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // --- CRUD Operations ---

  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // O create retorna void[cite: 44], então apenas aguardamos
      await appointmentService.createAppointment(formData);
      
      // Recarrega a lista do servidor para pegar o novo item
      fetchAppointments(searchTerm, 0, true);
      Swal.fire("Sucesso", "Consulta agendada com sucesso!", "success");
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError ? error.message : "Falha ao agendar consulta.";
      Swal.fire("Erro", mensagemDoBackend, "error");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editAppointment = async (id: string, formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // O update também retorna void.
      // Removemos a tentativa de atualizar o estado local manualmente (map)
      // pois não temos o objeto atualizado de volta.
      await appointmentService.updateAppointment(id, formData);
      
      // Recarrega a lista para mostrar os dados atualizados
      fetchAppointments(searchTerm, 0, true);
      
      Swal.fire("Sucesso", "Consulta atualizada com sucesso!", "success");
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError ? error.message : "Falha ao atualizar consulta.";
      Swal.fire("Erro", mensagemDoBackend, "error");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      Swal.fire("Sucesso", "Consulta removida.", "success");
      fetchAppointments(debouncedSearchTerm, 0, true);
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError ? error.message : "Falha ao deletar consulta.";
      Swal.fire("Erro", mensagemDoBackend, "warning");
    }
  };

  const loadMoreAppointments = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchAppointments(debouncedSearchTerm, page + 1);
    }
  }, [isLoading, hasMore, debouncedSearchTerm, page, fetchAppointments]);

  // --- Effects ---

  useEffect(() => {
    fetchAppointments(debouncedSearchTerm, 0, true);
  }, [debouncedSearchTerm, fetchAppointments]);

  useEffect(() => {
    loadInitialOptions();
  }, [loadInitialOptions]);

  return {
    appointments, // Agora é do tipo SolicitacaoSummary[]
    isLoading,
    error,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMoreAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
    refetch: () => fetchAppointments(debouncedSearchTerm, 0, true),
    typeOptions,
    slotOptions,
    isLoadingSlots,
    fetchSlotsForType,
  };
};