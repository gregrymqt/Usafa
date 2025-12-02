import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { ApiError } from "../../../../../shared";
import type {
  Appointment,
  AppointmentFormData,
  FormSelectOption,
} from "../types/appointment.type";
import * as appointmentService from "../services/appointment.service";
import { useDebounce } from "../../../../../shared/utils/forPages.utils";

export const useAppointments = () => {
  // --- Estados Principais ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Paginação ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // --- Estados para o Formulário (Selects Auxiliares) ---
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
        const response = await appointmentService.getAppointments({
          page: pageNumber,
          size: 10,
          search,
        });
        setAppointments((prev) =>
          isNewSearch ? response.content : [...prev, ...response.content]
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

  // 2. Carregar Opções Iniciais (Tipos de Consulta)
  const loadInitialOptions = useCallback(async () => {
    try {
      const types = await appointmentService.getTypeOptions();
      setTypeOptions(types);
    } catch (error: unknown) {
      console.error("Erro ao carregar tipos de consulta", error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar as opções de especialidade.";
      Swal.fire("Erro", mensagemDoBackend, "error");
    }
  }, []);

  // 3. Buscar Slots dinamicamente (Chamado pelo Form ao trocar Especialidade)
  const fetchSlotsForType = useCallback(async (tipoId: string) => {
    if (!tipoId) {
      setSlotOptions([]);
      return;
    }
    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getSlotsByType(tipoId);
      setSlotOptions(slots);
    } catch (error: unknown) {
      console.error("Erro ao buscar horários", error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Erro ao buscar horários disponíveis.";
      Swal.fire("Erro", mensagemDoBackend, "error");
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // --- CRUD Operations ---

  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const newAppointment = await appointmentService.createAppointment(formData);
      setAppointments((prev) => [newAppointment, ...prev]);
      fetchAppointments(searchTerm, 0, true);
      Swal.fire("Sucesso", "Consulta agendada com sucesso!", "success");
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Falha ao agendar consulta.";

      Swal.fire("Erro ao Agendar", mensagemDoBackend, "error");
      setError(mensagemDoBackend);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const editAppointment = async (id: string, formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const updatedAppointment = await appointmentService.updateAppointment(id, formData);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updatedAppointment : a))
      );
      Swal.fire("Sucesso", "Consulta atualizada com sucesso!", "success");
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Falha ao atualizar consulta.";

      Swal.fire("Erro ao Atualizar", mensagemDoBackend, "error");
      setError(mensagemDoBackend);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      Swal.fire("Sucesso", "Consulta deletada com sucesso.", "success");
      fetchAppointments(debouncedSearchTerm, 0, true);
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Falha ao deletar consulta.";

      Swal.fire("Não foi possível deletar", mensagemDoBackend, "warning");
      setError(mensagemDoBackend);
    }
  };

  const loadMoreAppointments = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchAppointments(debouncedSearchTerm, page + 1);
    }
  }, [isLoading, hasMore, debouncedSearchTerm, page, fetchAppointments]);

  // --- Effects ---

  // Busca lista principal ao mudar termo de busca
  useEffect(() => {
    fetchAppointments(debouncedSearchTerm, 0, true);
  }, [debouncedSearchTerm, fetchAppointments]);

  // Carrega os Tipos de Consulta ao montar o hook
  useEffect(() => {
    loadInitialOptions();
  }, [loadInitialOptions]);

  return {
    appointments,
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
    
    // --- Novos Retornos para o Form ---
    typeOptions,       // Lista de especialidades
    slotOptions,       // Lista de horários (populada via fetchSlotsForType)
    isLoadingSlots,    // Loading do select de horários
    fetchSlotsForType  // Função para atualizar os horários
  };
};