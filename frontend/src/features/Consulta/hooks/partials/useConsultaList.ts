import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { consultaService } from '../../services/consulta.service';
import { ConsultaSummary } from '../../types/consulta.types';


export const useConsultaList = (userId: string) => {
  // [CORREÇÃO] O estado agora usa o tipo correto que vem da API (ConsultaSummary)
  const [consultas, setConsultas] = useState<ConsultaSummary[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);
  const [hasMoreConsultas, setHasMoreConsultas] = useState(true);

  // [CORREÇÃO] O estado agora usa o tipo correto
  const [solicitacoes, setSolicitacoes] = useState<ConsultaSummary[]>([]);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);
  const [hasMoreSolicitacoes, setHasMoreSolicitacoes] = useState(true);

  // 1. Buscar Consultas (SQL)
  const fetchConsultas = useCallback(async (search = '', page = 0, isNewSearch = false) => {
    if (!userId) return;
    setIsLoadingConsultas(true);
    try {
      const data = await consultaService.getConsultasConfirmadas(userId, { 
        page, 
        size: 10, 
        search 
      });
      
      // Agora os tipos batem: prev é ConsultaSummary[] e data.content também
      setConsultas(prev => isNewSearch ? data.content : [...prev, ...data.content]);
      setHasMoreConsultas(!data.last);
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
      const data = await consultaService.getSolicitacoesPendentes(userId, page);
      
      setSolicitacoes(prev => isNewSearch ? data.content : [...prev, ...data.content]);
      setHasMoreSolicitacoes(!data.last);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSolicitacoes(false);
    }
  }, [userId]);

  const refreshAll = useCallback(() => {
    fetchConsultas('', 0, true);
    fetchSolicitacoes(0, true);
  }, [fetchConsultas, fetchSolicitacoes]);

  return {
    consultas,
    isLoadingConsultas,
    hasMoreConsultas,
    fetchConsultas,
    
    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    fetchSolicitacoes,

    refreshAll
  };
};