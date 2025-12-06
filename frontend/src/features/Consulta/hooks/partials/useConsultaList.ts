import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service';
// Importação correta do tipo atualizado
import type { AppointmentUserResponse } from '../../types/consulta.types';

export const useConsultaList = (userId: string) => {
  // --- Estados Confirmadas ---
  // Alterado de SolicitacaoSummary para AppointmentUserResponse
  const [consultas, setConsultas] = useState<AppointmentUserResponse[]>([]);
  const [pageConsultas, setPageConsultas] = useState(0);
  const [hasMoreConsultas, setHasMoreConsultas] = useState(true);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);

  // --- Estados Solicitações ---
  const [solicitacoes, setSolicitacoes] = useState<AppointmentUserResponse[]>([]);
  const [pageSolicitacoes, setPageSolicitacoes] = useState(0);
  const [hasMoreSolicitacoes, setHasMoreSolicitacoes] = useState(true);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);

  // 1. Buscar Consultas Confirmadas (SQL)
  const fetchConsultas = useCallback(async (search = '', page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingConsultas(true);
    try {
      const response = await consultaService.getConsultasConfirmadas({ page, size: 10, search });
      
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

  // 2. Buscar Solicitações Pendentes (Mongo/Redis)
  const fetchSolicitacoes = useCallback(async (page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingSolicitacoes(true);
    try {
      const response = await consultaService.getSolicitacoesPendentes(page);
      
      setSolicitacoes(prev => isNewSearch ? response.content : [...prev, ...response.content]);
      setHasMoreSolicitacoes(!response.last);
      setPageSolicitacoes(page);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSolicitacoes(false);
    }
  }, [userId]);

  // Load More Actions (Infintie Scroll)
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

  // Refresh Unificado (Para Search ou Updates)
  const refreshAll = useCallback(() => {
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
    fetchConsultas,   
    fetchSolicitacoes 
  };
};