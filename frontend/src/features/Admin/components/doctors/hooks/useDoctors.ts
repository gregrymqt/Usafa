import { useState, useCallback, useEffect, useRef } from "react";
import type { Doctor, NewDoctorData } from "../types/doctor.type";
import * as doctorService from "../services/doctor.service";
import { ApiError } from "../../../../../shared/exceptions/ApiError";
import { useDebounce } from "../../../../../shared/utils/forPages.utils";
import Swal from "sweetalert2";

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
  const isInitialFetch = useRef(true);

  // --- Lógica de Busca com Debounce ---
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /**
   * Busca os médicos da API.
   */
  const fetchDoctors = useCallback(async (term: string, pageNumber: number, isNewSearch = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getDoctors({ page: pageNumber, size: 20, search: term });
      
      setDoctors(prev => (isNewSearch ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      setPage(pageNumber);

    } catch (error: unknown) {
      const mensagemDoBackend =
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar os médicos.";

      Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
      setError(mensagemDoBackend);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efeito para buscar quando o termo muda (Debounce)
  useEffect(() => {
    if (!isInitialFetch.current) {
      // Reseta a página para 0 ao buscar algo novo
      fetchDoctors(debouncedSearchTerm, 0, true);
    }
  }, [debouncedSearchTerm, fetchDoctors]);

  // Efeito inicial (Mount)
  useEffect(() => {
    isInitialFetch.current = true;
    fetchDoctors(debouncedSearchTerm, 0, true).finally(() => {
      isInitialFetch.current = false;
    });
  }, [fetchDoctors]); 

  /**
   * Adiciona um novo médico.
   */
  const addDoctor = async (doctorData: NewDoctorData) => {
    setIsLoading(true);
    try {
      const newDoctor = await doctorService.createDoctor(doctorData);
      
      // Recarrega do zero para garantir consistência da lista
      fetchDoctors(debouncedSearchTerm, 0, true);
      
      Swal.fire('Sucesso', 'Médico criado com sucesso!', 'success');
      return newDoctor;
    } catch (error: unknown) {
      // Tratamento de erro robusto
      const errorMessage = error instanceof ApiError ? error.message : "Erro ao criar médico";
      setError(errorMessage);
      Swal.fire('Erro ao Criar', errorMessage, 'error');

      throw error; // Repassa o erro para o componente não fechar o modal
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Edita um médico.
   */
  const editDoctor = async (id: number | string, doctorData: Partial<NewDoctorData>) => {
    setIsLoading(true);
    try {
      // Agora o service espera o objeto com imageFile opcional
      const updatedDoctor = await doctorService.updateDoctor(String(id), doctorData);
      
      // Atualiza a lista localmente para evitar refetch desnecessário
      setDoctors((prev) => 
        prev.map((d) => (String(d.id) === String(id) ? updatedDoctor : d))
      );
      Swal.fire('Sucesso', 'Médico atualizado com sucesso!', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof ApiError ? error.message : "Erro ao atualizar médico";
      setError(errorMessage);
      Swal.fire('Erro ao Atualizar', errorMessage, 'error');

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove um médico.
   */
  const removeDoctor = async (id: number | string) => {
    try {
      await doctorService.deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => String(d.id) !== String(id)));
      Swal.fire('Sucesso', 'Médico deletado com sucesso.', 'success');
    } catch (error: unknown) {
      const errorMessage = error instanceof ApiError ? error.message : "Falha ao deletar médico";
      Swal.fire('Não foi possível deletar', errorMessage, 'warning');
      setError(errorMessage);
    }
  };

  /**
   * Carrega mais itens (Scroll Infinito).
   */
  const loadMoreDoctors = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchDoctors(debouncedSearchTerm, page + 1);
    }
  }, [isLoading, hasMore, debouncedSearchTerm, page, fetchDoctors]);

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