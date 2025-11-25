import { useState, useEffect, useCallback, useRef } from 'react';
import {
  NotificationEnvelope,
  type Consulta,
  type ConsultaFormOptions,
  type ConsultaRequest,
  type ConsultaSummary,
} from '../types/consulta.types';
import { getConsultas, getFormOptions, requestConsulta } from '../services/consulta.service';
import {
  connectWebSocket,
  subscribe,
  unsubscribe,
} from '../../../shared/services/websocket.service';
import { useDebounce } from '../../../shared/utils/forPages.utils';

export const useConsulta = (userId: string) => {
  // --- Estados ---
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoadingConsultas, setIsLoadingConsultas] = useState(true); 
  const [formOptions, setFormOptions] = useState<ConsultaFormOptions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [confirmedConsulta, setConfirmedConsulta] = useState<ConsultaSummary | null>(null);
  
  // --- Paginação e Busca ---
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Ref para o WebSocket conseguir ler o termo atual sem reiniciar conexão
  const searchTermRef = useRef(debouncedSearchTerm);

  useEffect(() => {
    searchTermRef.current = debouncedSearchTerm;
  }, [debouncedSearchTerm]);

  // --- 1. Busca de Consultas (HTTP) ---
  const fetchConsultas = useCallback(async (search: string, pageNumber: number, isNewSearch = false) => {
    if (!userId) return; // Proteção contra ID vazio

    setIsLoadingConsultas(true);
    setError(null);
    try {
      const consultasData = await getConsultas(userId, { page: pageNumber, size: 10, search });
      
      // --- CORREÇÃO AQUI ---
      // Adicionamos '|| []' para garantir que nunca seja undefined
      const novosItens = consultasData.content || []; 

      setConsultas(prev => isNewSearch ? novosItens : [...prev, ...novosItens]);
      
      // Verifica se 'last' existe, senão assume true para parar a paginação
      setHasMore(consultasData.last === false); 
      setPage(pageNumber);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Falha ao carregar suas consultas.');
      
      // Opcional: Se der erro, zera a lista na busca nova para não mostrar dados velhos
      if (isNewSearch) setConsultas([]); 
    } finally {
      setIsLoadingConsultas(false);
    }
  }, [userId]);

  // --- 2. Carga Inicial ---
  useEffect(() => {
    if (userId) {
      getFormOptions()
        .then(setFormOptions)
        .catch(err => console.error("Erro ao carregar opções:", err));
      
      // Busca inicial (apenas se não tiver busca digitada)
      if (!debouncedSearchTerm) {
         fetchConsultas('', 0, true);
      }
    }
  }, [userId]); // Removi fetchConsultas daqui para evitar loops, ele já é chamado no efeito abaixo

  // --- 3. Reação à Busca ---
  useEffect(() => {
    if (userId) {
        fetchConsultas(debouncedSearchTerm, 0, true);
    }
  }, [debouncedSearchTerm, fetchConsultas, userId]);


  // --- 4. Função Auxiliar de WebSocket (Interna) ---
  // Esta função não roda automaticamente, só quando chamamos.
  const setupWebSocketListener = () => {
    console.log("Iniciando conexão WebSocket sob demanda...");
    connectWebSocket(); 
    
    const topic = `/user/${userId}/queue/consultas`;

    const onNotificationReceived = (envelope: NotificationEnvelope<ConsultaSummary>) => {
      console.log("WebSocket Recebeu:", envelope.message);
      
      const summary = envelope.data; 
      setConfirmedConsulta(summary);
      
      // Atualiza a tabela
      fetchConsultas(searchTermRef.current, 0, true);
    };

    // Inscreve-se para ouvir a resposta
    subscribe<NotificationEnvelope<ConsultaSummary>>(topic, onNotificationReceived);
  };


  // --- 5. Ação de Enviar (Modificada) ---
  const handleSubmitConsulta = async (partialRequest: Partial<ConsultaRequest>) => {
    try {
      setIsSubmitting(true);
      setError(null); 
      
      // A) Inicia a escuta do WebSocket ANTES do envio HTTP
      // Isso garante que se o backend for muito rápido, já estamos ouvindo.
      setupWebSocketListener();

      const fullRequest: ConsultaRequest = {
        patientId: userId,
        tipoConsultaId: partialRequest.tipoConsultaId!,
        horarioSlotId: Number(partialRequest.horarioSlotId!),
        sintomas: partialRequest.sintomas || ''
      };

      // B) Faz o envio HTTP
      await requestConsulta(fullRequest);

      setShowSuccessMessage(true); 
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      // Atualiza opções para remover o horário agendado da lista
      const updatedOptions = await getFormOptions();
      setFormOptions(updatedOptions);
      
      // Atualiza a lista via HTTP também (redundância segura)
      fetchConsultas(searchTerm, 0, true);

    } catch (err) { 
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao realizar agendamento.'); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  const loadMoreConsultas = useCallback(() => {
    if (!isLoadingConsultas && hasMore) {
      fetchConsultas(debouncedSearchTerm, page + 1);
    }
  }, [isLoadingConsultas, hasMore, debouncedSearchTerm, page, fetchConsultas]);

  const closeConfirmationModal = useCallback(() => { 
    setConfirmedConsulta(null);
    // Opcional: Se quiser desconectar o socket ao fechar o modal para economizar mais:
    const topic = `/user/${userId}/queue/consultas`;
    unsubscribe(topic);
  }, [userId]);

  return { 
    consultas,
    isLoadingConsultas,
    formOptions,
    isSubmitting,
    showSuccessMessage,
    confirmedConsulta,
    error,
    searchTerm,
    setSearchTerm,
    hasMore,
    loadMoreConsultas,
    handleSubmitConsulta,
    closeConfirmationModal,
    refetchConsultas: () => fetchConsultas(debouncedSearchTerm, 0, true),
  };
};