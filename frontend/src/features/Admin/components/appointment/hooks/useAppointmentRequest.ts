import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '../../../../../shared';
import type { ConsultaDocument } from '../components/ConsultaRequest/Table/types/consultaRequestTable.type';
import { consultaService } from '../services/appointmentRequest.service';
import type { ConsultaUpdateData } from '../components/ConsultaRequest/Modal/types/ConsultaEditModal.type';
import { usePagination, useDebounce, type Page } from '../../../../../shared/utils/forPages.utils';
import { showErrorToast, showSuccessToast } from '../../../utils/adminUtils';

export const useConsultaRequests = () => {
  const [requests, setRequests] = useState<ConsultaDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [pageData, setPageData] = useState<Page<ConsultaDocument>>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // Página atual, base 0

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination({
    pageData,
    onPageChange: setCurrentPage,
  });

  /**
   * Busca as solicitações da API com paginação e filtro.
   */
  const fetchRequests = useCallback(async (page: number, search: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Assumindo que o service agora tem um método paginado
      const response = await consultaService.getRequests({
        page,
        size: 10, // Itens por página
        search,
      });
      setRequests(response.content);
      setPageData(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('Erro inesperado ao buscar solicitações.', 500));
      }
      showErrorToast('Não foi possível carregar as solicitações.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar os dados quando a página ou a busca mudam
  useEffect(() => {
    // Quando o termo de busca muda, voltamos para a primeira página
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
    fetchRequests(currentPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, currentPage, fetchRequests]);

  const handleUpdateStatus = useCallback(
    async (id: string, data: ConsultaUpdateData) => {
      try {
        const updatedDoc = await consultaService.updateStatus(id, data);
        setRequests(currentData =>
          currentData.map(item => (item.id === id ? updatedDoc : item))
        );
        showSuccessToast('Status da solicitação atualizado.');
      } catch (err) {
        showErrorToast(`Falha ao atualizar o status. ${err instanceof ApiError ? err.message : ''}`);
      }
    },
    []
  );

  /**
   * Função para DELETAR uma solicitação.
   */
  const handleDeleteRequest = useCallback(async (id: string) => {
    try {
      await consultaService.deleteRequest(id);
      showSuccessToast('Solicitação deletada com sucesso.');
      // Recarrega a página atual para manter a consistência da paginação
      fetchRequests(currentPage, debouncedSearchTerm);
    } catch (err) {
      showErrorToast(`Falha ao deletar a solicitação. ${err instanceof ApiError ? err.message : ''}`);
    }
  }, [currentPage, debouncedSearchTerm, fetchRequests]);

  return {
    requests,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage: currentPage + 1, // Expor para a UI como base 1
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    handleUpdateStatus,
    handleDeleteRequest,
    refetch: () => fetchRequests(currentPage, debouncedSearchTerm),
  };
};