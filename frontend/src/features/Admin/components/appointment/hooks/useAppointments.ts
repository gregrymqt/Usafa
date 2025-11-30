import { useState, useCallback, useEffect } from "react";
import { ApiError } from "../../../../../shared";
import { showErrorToast, showSuccessToast } from "../../../utils/adminUtils";
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
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          showErrorToast("Não foi possível carregar as consultas.");
        }
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
    } catch (err) {
      console.error("Erro ao carregar tipos de consulta", err);
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
    } catch (err) {
      console.error("Erro ao buscar horários", err);
      showErrorToast("Erro ao buscar horários disponíveis.");
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
      showSuccessToast("Consulta agendada com sucesso!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao agendar consulta: ${err.message}`);
      }
      throw err;
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
      showSuccessToast("Consulta atualizada com sucesso!");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao atualizar consulta: ${err.message}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      showSuccessToast("Consulta deletada com sucesso.");
      fetchAppointments(debouncedSearchTerm, 0, true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao deletar consulta: ${err.message}`);
      }
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