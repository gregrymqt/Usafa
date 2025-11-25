import { useState, useCallback, useEffect, useRef } from "react";
import { showErrorToast, showSuccessToast } from "../../../utils/adminUtils";
import type { Doctor, NewDoctorData, UpdateDoctorData } from "../types/doctor.type";
import * as doctorService from "../services/doctor.service";
import { ApiError } from "../../../../../shared/exceptions/ApiError";
import { useDebounce } from "../../../../../shared/utils/forPages.utils";
// Importando o hook de debounce que você mencionou

/**
 * Hook customizado para gerenciar a lógica de médicos,
 * incluindo busca, paginação e operações CRUD.
 */
export const useDoctors = (initialSearchTerm = "") => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Lógica de Paginação e Scroll Infinito ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isInitialFetch = useRef(true); // Para controlar a primeira carga

  // --- Lógica de Busca com Debounce ---
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms de espera

  /**
   * Busca os médicos da API, gerenciando paginação e busca.
   * @param term - O termo de busca.
   * @param pageNumber - O número da página a ser buscada.
   * @param isNewSearch - Se true, limpa a lista atual antes de buscar.
   */
  const fetchDoctors = useCallback(async (term: string, pageNumber: number, isNewSearch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Assumindo que o serviço agora aceita paginação e busca
      const data = await doctorService.getDoctors({ page: pageNumber, size: 20, search: term });
      
      setDoctors(prev => (isNewSearch ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      setPage(pageNumber);

    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        showErrorToast('Não foi possível carregar os médicos.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar quando o termo de busca (debounced) muda
  useEffect(() => {
    // Evita a busca inicial duplicada, pois o `useEffect` abaixo já cuida disso
    if (!isInitialFetch.current) {
      fetchDoctors(debouncedSearchTerm, 0, true);
    }
  }, [debouncedSearchTerm, fetchDoctors]);

  // Efeito para a carga inicial
  useEffect(() => {
    isInitialFetch.current = true;
    fetchDoctors(debouncedSearchTerm, 0, true).finally(() => {
      isInitialFetch.current = false;
    });
  }, [fetchDoctors]); // Apenas na montagem

  /**
   * Adiciona um novo médico.
   */
  const addDoctor = async (doctorData: NewDoctorData) => {
    setIsLoading(true);
    try {
      const newDoctor = await doctorService.createDoctor(doctorData);
      // Recarrega a lista para refletir a ordem correta da paginação
      fetchDoctors(searchTerm, 0, true);
      showSuccessToast('Médico criado com sucesso!');
      return newDoctor; // Retorna o médico criado para o chamador
    } catch (err) {
      if( err instanceof ApiError){
      setError(err.message);
      showErrorToast(`Falha ao criar médico: ${err.message}`);
      throw err; // Propaga o erro para o formulário (para não fechar o modal)
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carrega a próxima página de resultados (para scroll infinito).
   */
  const loadMoreDoctors = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchDoctors(debouncedSearchTerm, page + 1);
    }
  }, [isLoading, hasMore, debouncedSearchTerm, page, fetchDoctors]);
  
  /**
   * Remove um médico (após confirmação na UI).
   */
  const removeDoctor = async (id: number | string) => {
    // A confirmação (com showDeleteConfirm) deve ser feita no componente.
    // Este hook apenas executa a deleção.
    try {
      await doctorService.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      showSuccessToast('Médico deletado com sucesso.');
    } catch (err) {
      if( err instanceof ApiError){
      setError(err.message);
      showErrorToast(`Falha ao deletar médico: ${err.message}`);
      }
    }
  };

  /**
   * Edita um médico.
   */
  const editDoctor = async (id: number | string, doctorData: UpdateDoctorData) => {
    setIsLoading(true);
    try {
      const updatedDoctor = await doctorService.updateDoctor(id, doctorData);
      setDoctors((prev) =>
        prev.map((d) => (d.id === id ? updatedDoctor : d))
      );
      showSuccessToast('Médico atualizado com sucesso!');
    } catch (err) {
      if( err instanceof ApiError){
      setError(err.message);
      showErrorToast(`Falha ao atualizar médico: ${err.message}`);
      throw err; // Propaga o erro para o formulário
    }
   } finally {
      setIsLoading(false);
  
    } 
  };

  return {
    doctors,
    isLoading,
    error,
    hasMore,
    searchTerm,
    setSearchTerm,
    loadMoreDoctors,
    reloadDoctors: () => fetchDoctors(debouncedSearchTerm, 0, true),
    addDoctor,
    removeDoctor,
    editDoctor,
  };
};