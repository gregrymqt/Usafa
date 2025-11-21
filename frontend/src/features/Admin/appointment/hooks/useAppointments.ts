import { useState, useCallback, useEffect } from "react";
import { ApiError } from "../../../../shared";
import { showErrorToast, showSuccessToast } from "../../utils/adminUtils";
import type {
  Appointment,
  AppointmentFormData,
} from "../types/appointment.type";
import * as appointmentService from "../services/appointment.service";
import { useDebounce } from "../../../../shared/utils/forPages.utils";

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Lógica de Paginação e Scroll Infinito ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchAppointments = useCallback(
    async (search: string, pageNumber: number, isNewSearch = false) => {
      setIsLoading(true);
      setError(null);
      try {
        // Assumindo que o serviço será atualizado para aceitar paginação
        const response = await appointmentService.getAppointments({
          page: pageNumber,
          size: 10, // ou o tamanho de página que preferir
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

  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Não precisamos converter datas. O formData já tem os IDs corretos.
      const newAppointment = await appointmentService.createAppointment(
        formData
      );

      setAppointments((prev) => [newAppointment, ...prev]);
      fetchAppointments(searchTerm, 0, true); // Recarrega para consistência da paginação
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
      // Envia o formData direto (patientId, horarioSlotId, tipoConsultaId, status)
      const updatedAppointment = await appointmentService.updateAppointment(
        id,
        formData
      );

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
      fetchAppointments(debouncedSearchTerm, 0, true); // Recarrega do início após deletar
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

  useEffect(() => {
    // Quando o termo de busca muda, voltamos para a primeira página
    fetchAppointments(debouncedSearchTerm, 0, true);
  }, [debouncedSearchTerm, fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    hasMore,
    // Controle de busca
    searchTerm,
    setSearchTerm,
    // Scroll Infinito
    loadMoreAppointments,
    // Funções de CRUD
    addAppointment,
    removeAppointment,
    editAppointment,
    refetch: () => fetchAppointments(debouncedSearchTerm, 0, true),
  };
};
