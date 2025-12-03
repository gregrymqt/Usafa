import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service'; // Ajuste o caminho
import type { ConsultaSummary } from '../../types/consulta.types';

export const useConsultaList = (userId: string) => {
  // --- Estados SQL (Confirmadas) ---
  const [consultas, setConsultas] = useState<ConsultaSummary[]>([]);
  const [pageConsultas, setPageConsultas] = useState(0);
  const [hasMoreConsultas, setHasMoreConsultas] = useState(false);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);

  // --- Estados Mongo (Solicitações) ---
  const [solicitacoes, setSolicitacoes] = useState<ConsultaSummary[]>([]);
  const [pageSolicitacoes, setPageSolicitacoes] = useState(0);
  const [hasMoreSolicitacoes, setHasMoreSolicitacoes] = useState(false);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);

  // 1. Função de Busca Confirmadas (SQL)
  const fetchConsultas = useCallback(async (search = '', page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingConsultas(true);
    try {
      const data = await consultaService.getConsultasConfirmadas(userId, { page, size: 10, search });
      
      setConsultas(prev => isNewSearch ? data.content : [...prev, ...data.content]);
      setHasMoreConsultas(!data.last); // Se last=false, tem mais
      setPageConsultas(page);
      
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar histórico.', 'error');
    } finally {
      setIsLoadingConsultas(false);
    }
  }, [userId]);

  // 2. Função de Busca Solicitações (Mongo)
  const fetchSolicitacoes = useCallback(async (page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingSolicitacoes(true);
    try {
      const data = await consultaService.getSolicitacoesPendentes(userId, page);
      
      setSolicitacoes(prev => isNewSearch ? data.content : [...prev, ...data.content]);
      setHasMoreSolicitacoes(!data.last);
      setPageSolicitacoes(page);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSolicitacoes(false);
    }
  }, [userId]);

  // 3. Funções "Load More" (Chamadas pelo scroll infinito da Lista)
  const loadMoreConsultas = useCallback(() => {
    if (!isLoadingConsultas && hasMoreConsultas) {
      fetchConsultas('', pageConsultas + 1, false);
    }
  }, [isLoadingConsultas, hasMoreConsultas, pageConsultas, fetchConsultas]);

  const loadMoreSolicitacoes = useCallback(() => {
    if (!isLoadingSolicitacoes && hasMoreSolicitacoes) {
      fetchSolicitacoes(pageSolicitacoes + 1, false);
    }
  }, [isLoadingSolicitacoes, hasMoreSolicitacoes, pageSolicitacoes, fetchSolicitacoes]);

  // Refresh Geral (Zera tudo)
  const refreshAll = useCallback(() => {
    fetchConsultas('', 0, true);
    fetchSolicitacoes(0, true);
  }, [fetchConsultas, fetchSolicitacoes]);

  return {
    // SQL
    consultas,
    isLoadingConsultas,
    hasMoreConsultas,
    loadMoreConsultas,
    fetchConsultas,

    // Mongo
    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    loadMoreSolicitacoes,
    fetchSolicitacoes,

    refreshAll
  };
};