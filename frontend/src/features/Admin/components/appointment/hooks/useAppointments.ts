import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { ApiError } from "../../../../../shared";
import type {
  Appointment,
  AppointmentFormData,
  FormSelectOption,
  ConsultaFormOptionsResponse // Importe a interface nova que criamos
} from "../types/appointment.type";
import { useDebounce } from "../../../../../shared/utils/forPages.utils";
import { appointmentService } from "../services/appointment.service";

export const useAppointments = () => {
  // --- Estados Principais ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Paginação ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // --- Estados para o Formulário ---
  const [typeOptions, setTypeOptions] = useState<FormSelectOption[]>([]);
  const [slotOptions, setSlotOptions] = useState<FormSelectOption[]>([]); // Slots do médico
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

  // 2. Carregar Opções Iniciais (CORRIGIDO)
  // Agora desestrutura o objeto para pegar apenas os 'tipos' (Especialidades)
  const loadInitialOptions = useCallback(async () => {
    try {
      // Chama o método novo que busca /consultas/options
      const data: ConsultaFormOptionsResponse = await appointmentService.getFormOptions();
      
      // Salva apenas a lista de especialidades no estado
      // Se vier null/undefined, garante array vazio
      setTypeOptions(data.tipos || []);
      
      // Se futuramente precisar da lista de médicos geral, salvaria aqui:
      // setDoctorOptions(data.medicos || []); 
      
    } catch (error: unknown) {
      console.error("Erro ao carregar opções do formulário", error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar as especialidades.";
      // Não damos alert aqui para não bloquear a tela, apenas log
      console.warn(mensagemDoBackend);
    }
  }, []);

  // 3. Buscar Slots dinamicamente (Mantido e revisado)
  const fetchSlotsForType = useCallback(async (tipoId: string) => {
    // Se o usuário limpar o select (vier vazio), limpamos os slots
    if (!tipoId) {
      setSlotOptions([]);
      return;
    }

    setIsLoadingSlots(true);
    try {
      const slots = await appointmentService.getSlotsByType(tipoId);
      const slotsFormatados = slots.map(slot => ({
        ...slot,
        value: String(slot.value) 
      }));
      
      setSlotOptions(slotsFormatados);
    } catch (error: unknown) {
      console.error("Erro ao buscar horários", error);
      Swal.fire("Atenção", "Não há horários disponíveis para esta especialidade.", "info");
      setSlotOptions([]); // Limpa em caso de erro para não mostrar lixo
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // --- CRUD Operations (Mantidas iguais) ---

  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const newAppointment = await appointmentService.createAppointment(formData);
      setAppointments((prev) => [newAppointment, ...prev]);
      // Atualiza a lista para refletir a mudança
      fetchAppointments(searchTerm, 0, true);
      Swal.fire("Sucesso", "Consulta agendada com sucesso!", "success");
    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Falha ao agendar consulta.";
      Swal.fire("Erro", mensagemDoBackend, "error");
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
        error instanceof ApiError
          ? error.message
          : "Falha ao deletar consulta.";
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
    
    // Exports para o Form
    typeOptions,       
    slotOptions,       
    isLoadingSlots,    
    fetchSlotsForType  
  };
};