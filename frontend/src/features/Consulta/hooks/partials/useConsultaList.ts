// useConsultaList.ts
import { useState, useCallback } from 'react';

import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service';
import { ConsultaSummary } from '../../types/consulta.types';

export const useConsultaList = (userId: string) => {
  // --- Estados Confirmadas ---
  const [consultas, setConsultas] = useState<ConsultaSummary[]>([]);
  const [pageConsultas, setPageConsultas] = useState(0);
  const [hasMoreConsultas, setHasMoreConsultas] = useState(true); // Começa true para tentar carregar
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);

  // --- Estados Solicitações ---
  const [solicitacoes, setSolicitacoes] = useState<ConsultaSummary[]>([]);
  const [pageSolicitacoes, setPageSolicitacoes] = useState(0);
  const [hasMoreSolicitacoes, setHasMoreSolicitacoes] = useState(true);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);

  // 1. Buscar Consultas (SQL)
  const fetchConsultas = useCallback(async (search = '', page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingConsultas(true);
    try {
      // Endpoint existe: getConsultasConfirmadas
      const response = await consultaService.getConsultasConfirmadas(userId, { page, size: 10, search });
      
      setConsultas(prev => isNewSearch ? response.content : [...prev, ...response.content]);
      setHasMoreConsultas(!response.last);
      setPageConsultas(page);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar histórico.', 'error');
    } finally {
      setIsLoadingConsultas(false);
    }
  }, [userId]);

  // 2. Buscar Solicitações (Mongo)
  const fetchSolicitacoes = useCallback(async (page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingSolicitacoes(true);
    try {
      // Endpoint existe: getSolicitacoesPendentes
      const response = await consultaService.getSolicitacoesPendentes(userId, page);
      
      setSolicitacoes(prev => isNewSearch ? response.content : [...prev, ...response.content]);
      setHasMoreSolicitacoes(!response.last);
      setPageSolicitacoes(page);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSolicitacoes(false);
    }
  }, [userId]);

  // Load More Actions
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

  // Init
  const refreshAll = useCallback(() => {
    // Reseta paginação e listas
    fetchConsultas('', 0, true);
    fetchSolicitacoes(0, true);
  }, [fetchConsultas, fetchSolicitacoes]);
  
return {
    consultas,
    isLoadingConsultas,
    hasMoreConsultas,
    loadMoreConsultas,
    
    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    loadMoreSolicitacoes,

    refreshAll,
    
    // ADICIONE ESTAS DUAS LINHAS:
    fetchConsultas,    // Necessário para o Search do pai
    fetchSolicitacoes  // Necessário para controle fino do pai
  };
};