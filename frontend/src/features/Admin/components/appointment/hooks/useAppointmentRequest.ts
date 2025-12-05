import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { ApiError } from "../../../../../shared";
// Imports Atualizados
import type { 
  AppointmentAdminResponse, 
  AppointmentOperation 
} from "../types/appointment.type";
import { appointmentRequestService } from "../services/appointmentRequest.service";
import {
  usePagination,
  useDebounce,
  type Page,
} from "../../../../../shared/utils/forPages.utils";

export const useAppointmentRequests = () => {
  // Estado tipado com AppointmentAdminResponse (Dados completos para tabela admin)
  const [requests, setRequests] = useState<AppointmentAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const [pageData, setPageData] = useState<Page<AppointmentAdminResponse>>();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); 
  const [currentPage, setCurrentPage] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { totalPages, goToPage, nextPage, prevPage, canGoNext, canGoPrev } =
    usePagination({
      pageData,
      onPageChange: setCurrentPage,
    });

  /**
   * Busca as solicitações da API (Admin View)
   */
  const fetchRequests = useCallback(
    async (page: number, search: string, status: string) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Chama o serviço do Admin que retorna Page<AppointmentAdminResponse>
        const response = await appointmentRequestService.getRequestsAdmin({
          page,
          size: 10,
          search,
          status: status || undefined, // Envia undefined se vazio para filtrar tudo
        });
        
        setRequests(response.content);
        setPageData(response);
      } catch (error: unknown) {
        console.error(error);
        const mensagemDoBackend =
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar as solicitações.";

        Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
        if (error instanceof ApiError) {
          setError(error);
        } else {
          setError(new ApiError("Erro inesperado.", 500));
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Efeitos de Busca
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      fetchRequests(currentPage, debouncedSearchTerm, statusFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, statusFilter]);

  // Efeito de Paginação
  useEffect(() => {
    fetchRequests(currentPage, debouncedSearchTerm, statusFilter);
  }, [currentPage, fetchRequests]);


  /**
   * Atualiza Status (Aceitar/Recusar)
   * Usa AppointmentOperationDTO conforme definido no Java
   */
  const handleUpdateStatus = useCallback(
    async (id: string, data: AppointmentOperation) => {
      try {
        // O backend retorna void no updateStatus ou o objeto atualizado.
        // Por segurança, recarregamos a lista para garantir consistência.
        await appointmentRequestService.updateStatus(id, data);
        
        fetchRequests(currentPage, debouncedSearchTerm, statusFilter);
        
        Swal.fire("Sucesso", "Status da solicitação atualizado.", "success");
      } catch (error: unknown) {
        console.error(error);
        const mensagemDoBackend =
          error instanceof ApiError
            ? error.message
            : "Falha ao atualizar o status.";
        Swal.fire("Erro ao Atualizar", mensagemDoBackend, "error");
      }
    },
    [currentPage, debouncedSearchTerm, statusFilter, fetchRequests]
  );

  /**
   * Deleta Solicitação
   */
  const handleDeleteRequest = useCallback(
    async (id: string) => {
      try {
        await appointmentRequestService.deleteRequest(id);
        Swal.fire("Sucesso", "Solicitação deletada com sucesso.", "success");
        fetchRequests(currentPage, debouncedSearchTerm, statusFilter);
      } catch (error: unknown) {
        console.error(error);
        const mensagemDoBackend =
          error instanceof ApiError
            ? error.message
            : "Falha ao deletar a solicitação.";
        Swal.fire("Não foi possível deletar", mensagemDoBackend, "warning");
      }
    },
    [currentPage, debouncedSearchTerm, statusFilter, fetchRequests]
  );

  return {
    requests,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage: currentPage + 1,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    handleUpdateStatus,
    handleDeleteRequest,
    refetch: () => fetchRequests(currentPage, debouncedSearchTerm, statusFilter),
  };
};