import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service';
import { SolicitacaoSummary } from '../../types/consulta.types';


export const useConsultaList = (userId: string) => {
  // --- Estado: Consultas Confirmadas (SQL) ---
  const [consultas, setConsultas] = useState<SolicitacaoSummary[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);
  
  // --- Estado: Solicitações (Mongo/Redis) ---
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSummary[]>([]);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);

  // 1. Buscar Consultas Confirmadas
  const fetchConsultas = useCallback(async (search = '', page = 0) => {
    if (!userId) return;
    setIsLoadingConsultas(true);
    try {
      const data = await consultaService.getConsultasConfirmadas(userId, { 
        page, 
        size: 10, 
        search 
      });
      // Lógica simplificada: sobrescreve a lista (se quiser infinito, usar spread)
      setConsultas(data.content); 
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar histórico.', 'error');
    } finally {
      setIsLoadingConsultas(false);
    }
  }, [userId]);

  // 2. Buscar Solicitações Pendentes
  const fetchSolicitacoes = useCallback(async (page = 0) => {
    if (!userId) return;
    setIsLoadingSolicitacoes(true);
    try {
      const data = await consultaService.getSolicitacoesPendentes(userId, page);
      setSolicitacoes(data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSolicitacoes(false);
    }
  }, [userId]);

  // Refresh Unificado
  const refreshAll = useCallback(() => {
    fetchConsultas();
    fetchSolicitacoes();
  }, [fetchConsultas, fetchSolicitacoes]);

  return {
    consultas,
    isLoadingConsultas,
    fetchConsultas,
    
    solicitacoes,
    isLoadingSolicitacoes,
    fetchSolicitacoes,

    refreshAll
  };
};