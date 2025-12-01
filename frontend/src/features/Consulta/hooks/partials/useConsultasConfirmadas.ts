// hooks/partials/useConsultasConfirmadas.ts
import { useState, useCallback } from 'react';
import { Consulta } from '../../types/consulta.types';
import { getConsultas } from '../../services/consulta.service';


export const useConsultasConfirmadas = (userId: string) => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchConsultas = useCallback(async (search: string, pageNumber: number, isNewSearch = false) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await getConsultas(userId, { page: pageNumber, size: 10, search });
      const novosItens = data.content || []; // [cite: 13]

      setConsultas(prev => isNewSearch ? novosItens : [...prev, ...novosItens]);
      setHasMore(data.last === false);
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      if (isNewSearch) setConsultas([]); // [cite: 14]
    } finally {
      setIsLoading(false); // [cite: 15]
    }
  }, [userId]);

  const loadMore = (search: string) => {
    if (!isLoading && hasMore) fetchConsultas(search, page + 1);
  };

  return { consultas, isLoading, hasMore, fetchConsultas, loadMore };
};