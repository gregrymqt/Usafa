// hooks/partials/useSolicitacoes.ts
import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Solicitacao } from '../../types/consulta.types';
import { getSolicitacoes } from '../../services/consulta.service';
import { ApiError } from '../../../../shared';

export const useSolicitacoes = (userId: string) => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchSolicitacoes = useCallback(async (pageNumber: number, isNewSearch = false) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await getSolicitacoes(userId, pageNumber);
      const novosItens = data.content || [];

      setSolicitacoes(prev => isNewSearch ? novosItens : [...prev, ...novosItens]);
      setHasMore(data.last === false);
      setPage(pageNumber);
    } catch (error: unknown) {
      console.error(error);
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar as solicitações.";

      Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
      if (isNewSearch) setSolicitacoes([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadMore = () => {
    if (!isLoading && hasMore) fetchSolicitacoes(page + 1);
  };

  return { solicitacoes, isLoading, hasMore, fetchSolicitacoes, loadMore };
};