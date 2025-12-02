import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { ApiError } from "../../../../../shared";
import type { ConsultaDocument } from "../components/ConsultaRequest/Table/types/consultaRequestTable.type";
import { consultaService } from "../services/appointmentRequest.service";
import type { ConsultaUpdateData } from "../components/ConsultaRequest/Modal/types/ConsultaEditModal.type";
import {
  usePagination,
  useDebounce,
  type Page,
} from "../../../../../shared/utils/forPages.utils";

export const useConsultaRequests = () => {
  const [requests, setRequests] = useState<ConsultaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [pageData, setPageData] = useState<Page<ConsultaDocument>>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // 1. Adiciona estado para o filtro de status
  const [currentPage, setCurrentPage] = useState(0); // Página atual, base 0

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { totalPages, goToPage, nextPage, prevPage, canGoNext, canGoPrev } =
    usePagination({
      pageData,
      onPageChange: setCurrentPage,
    });

  /**
   * Busca as solicitações da API com paginação e filtro.
   */
  const fetchRequests = useCallback(
    async (page: number, search: string, status: string) => {
      // 2. Adiciona 'status' como parâmetro
      try {
        setIsLoading(true);
        setError(null);
        // 3. Passa os filtros 'search' e 'status' para o serviço
        const response = await consultaService.getRequests({
          page,
          size: 10, // Itens por página
          search,
          status,
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
          setError(
            new ApiError("Erro inesperado ao buscar solicitações.", 500)
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Efeito para buscar os dados quando a página ou a busca mudam
  useEffect(() => {
    // Quando um filtro muda, voltamos para a primeira página
    if (currentPage !== 0) {
      // Evita um re-render desnecessário se já estiver na página 0
      setCurrentPage(0);
    }
    fetchRequests(currentPage, debouncedSearchTerm, statusFilter);
  }, [debouncedSearchTerm, statusFilter, currentPage, fetchRequests]); // 4. Adiciona 'statusFilter' às dependências

  const handleUpdateStatus = useCallback(
    async (id: string, data: ConsultaUpdateData) => {
      try {
        const updatedDoc = await consultaService.updateStatus(id, data);
        setRequests((currentData) =>
          currentData.map((item) => (item.id === id ? updatedDoc : item))
        );
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
    []
  );

  /**
   * Função para DELETAR uma solicitação.
   */
  const handleDeleteRequest = useCallback(
    async (id: string) => {
      try {
        await consultaService.deleteRequest(id);
        Swal.fire("Sucesso", "Solicitação deletada com sucesso.", "success");
        // 5. Recarrega a página atual com os filtros ativos
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
  ); // 6. Adiciona 'statusFilter' às dependências

  return {
    requests,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter, // 7. Expõe o estado do filtro e seu setter
    setStatusFilter,
    currentPage: currentPage + 1, // Expor para a UI como base 1
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    handleUpdateStatus,
    handleDeleteRequest,
    refetch: () =>
      fetchRequests(currentPage, debouncedSearchTerm, statusFilter), // 8. Atualiza o refetch
  };
};
