import { useState, useEffect, useCallback } from 'react';
import  { ApiError } from '../../../../shared';
import type { ConsultaDocument } from '../components/ConsultaRequest/Table/types/consultaRequestTable.type';
import  { consultaService } from '../services/appointmentRequest.service';
import type { ConsultaUpdateData } from '../components/ConsultaRequest/Modal/types/ConsultaEditModal.type';


export const useConsultaRequests = () => {
  // Estado para os dados [cite: 23-26]
  const [data, setData] = useState<ConsultaDocument[] | null>(null);
  
  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado de erro
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Função para buscar os dados iniciais.
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const requests = await consultaService.getAllRequests(); // Chama o service [cite: 14]
      setData(requests);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('Erro inesperado ao buscar solicitações.', 500));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca os dados quando o hook é montado
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = useCallback(
    async (id: string, data: ConsultaUpdateData) => {
      try {
        // 1. Chama o service para atualizar na API
        //    (Assumindo que seu service agora aceita o objeto 'data')
        const updatedDoc = await consultaService.updateStatus(id, data);

        // 2. Atualiza o estado local (para UI reativa) 
        setData(currentData =>
          currentData?.map(item =>
            item.id === id ? updatedDoc : item // Substitui o item antigo pelo novo
          ) || null
        );
      } catch (err) {
        console.error('[useConsultaRequests] Erro ao atualizar status:', err);
        // Aqui você pode adicionar um toast de erro, por exemplo
      }
    },
    [setData] // setData é uma dependência estável do useState
  );

  /**
   * Função para DELETAR uma solicitação.
   */
  const handleDeleteRequest = useCallback(async (id: string) => {
    try {
      // 1. Chama o service para deletar na API
      await consultaService.deleteRequest(id);

      // 2. Atualiza o estado local (remove o item da lista)
      setData(currentData => 
        currentData?.filter(item => item.id !== id) || null
      );
    } catch (err) {
      console.error('[useConsultaRequests] Erro ao deletar:', err);
      // Aqui você pode adicionar um toast de erro
    }
  }, []);

  // Retorna tudo que o componente precisa 
  return { 
    requests: data, // Os dados
    isLoading,       // O estado de loading
    error,           // O estado de erro
    handleUpdateStatus, // Função para atualizar
    handleDeleteRequest, // Função para deletar
    refetch: fetchData // Função para recarregar os dados, se necessário
  };
};