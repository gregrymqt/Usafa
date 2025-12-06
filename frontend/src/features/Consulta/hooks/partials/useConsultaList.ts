import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { consultaService } from "../../services/consulta.service";
// Importação correta do tipo atualizado
import type { AppointmentUserResponse } from "../../types/consulta.types";

export const useConsultaList = (userId: string) => {
  // --- Estados Confirmadas ---
  // Alterado de SolicitacaoSummary para AppointmentUserResponse
  const [consultas, setConsultas] = useState<AppointmentUserResponse[]>([]);
  const [pageConsultas, setPageConsultas] = useState(0);
  const [hasMoreConsultas, setHasMoreConsultas] = useState(true);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(false);

  // --- Estados Solicitações ---
  const [solicitacoes, setSolicitacoes] = useState<AppointmentUserResponse[]>(
    []
  );
  const [pageSolicitacoes, setPageSolicitacoes] = useState(0);
  const [hasMoreSolicitacoes, setHasMoreSolicitacoes] = useState(true);
  const [isLoadingSolicitacoes, setIsLoadingSolicitacoes] = useState(false);

  // 1. Buscar Consultas Confirmadas (SQL)
  const fetchConsultas = useCallback(
    async (search = "", page = 0, isNewSearch = false) => {
      if (!userId) return;

      // TRAVA 1: Se não é nova busca e já acabou, aborta
      if (!isNewSearch && !hasMoreConsultas) return;

      setIsLoadingConsultas(true);
      try {
        const response = await consultaService.getConsultasConfirmadas(userId, {
          page,
          size: 10,
          search,
        });

        setConsultas((prev) =>
          isNewSearch ? response.content : [...prev, ...response.content]
        );

        // TRAVA 2: Se content for vazio, força last = true
        const isLastPage = response.last || response.content.length === 0;
        setHasMoreConsultas(!isLastPage);

        setPageConsultas(page);
      } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Falha ao carregar histórico.", "error");
        setHasMoreConsultas(false); // Em caso de erro, para de tentar buscar
      } finally {
        setIsLoadingConsultas(false);
      }
    },
    [userId, hasMoreConsultas]
  );

  // 2. Buscar Solicitações Pendentes (Mongo/Redis)
  const fetchSolicitacoes = useCallback(
    async (page = 0, isNewSearch = false) => {
      if (!userId) return;

      // 1. TRAVA DE INÍCIO: Se não é uma nova busca e já acabou a lista, não faz nada.
      // Isso evita chamadas desnecessárias se o usuario rolar muito rápido para cima e para baixo.
      if (!isNewSearch && !hasMoreSolicitacoes) return;

      setIsLoadingSolicitacoes(true);
      try {
        const response = await consultaService.getSolicitacoesPendentes(page);

        setSolicitacoes((prev) =>
          isNewSearch ? response.content : [...prev, ...response.content]
        );

        // 2. TRAVA DE CONTEÚDO: Se a lista vier vazia, forçamos o fim.
        // Às vezes o backend diz last:false mas manda lista vazia, isso previne o loop.
        const isReallyLast = response.last || response.content.length === 0;
        setHasMoreSolicitacoes(!isReallyLast);

        setPageSolicitacoes(page);
      } catch (error) {
        console.error(error);
        // 3. TRAVA DE ERRO: Se der erro, assumimos que não tem mais nada para evitar loops de erro.
        setHasMoreSolicitacoes(false);
      } finally {
        setIsLoadingSolicitacoes(false);
      }
    },
    [userId, hasMoreSolicitacoes]
  ); // Adicione hasMoreSolicitacoes aqui

  // Load More Actions (Infintie Scroll)
  const loadMoreConsultas = useCallback(() => {
    if (!isLoadingConsultas && hasMoreConsultas) {
      fetchConsultas("", pageConsultas + 1, false);
    }
  }, [isLoadingConsultas, hasMoreConsultas, pageConsultas, fetchConsultas]);

  const loadMoreSolicitacoes = useCallback(() => {
    if (!isLoadingSolicitacoes && hasMoreSolicitacoes) {
      fetchSolicitacoes(pageSolicitacoes + 1, false);
    }
  }, [
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    pageSolicitacoes,
    fetchSolicitacoes,
  ]);

  // Refresh Unificado (Para Search ou Updates)
  const refreshAll = useCallback(() => {
    fetchConsultas("", 0, true);
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
    fetchSolicitacoes,
  };
};
