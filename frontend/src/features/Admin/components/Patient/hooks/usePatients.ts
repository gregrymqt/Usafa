import { useState, useCallback, useEffect } from "react";
import type {
  Patient,
  PatientFormData,
  NewPatientData,
  UpdatePatientData,
} from "../types/patient.type";
import * as patientService from "../services/patient.service";
import { useDebounce } from "../../../../../shared/utils/forPages.utils";
import { ApiError } from "../../../../../shared";
import { validateCpf } from "../../../../../shared/utils/validators.utils";
import Swal from "sweetalert2";

/**
 * Converte a data do formulário (YYYY-MM-DD) para ISO string UTC.
 */
const convertFormDateToISO = (dateString: string): string => {
  if (!dateString) return "";
  return dateString; 
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Lógica de Paginação e Scroll Infinito
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Hook para debounce do termo de busca
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /**
   * Busca os pacientes da API com paginação e filtro.
   */
  const fetchPatients = useCallback(
    async (search: string, pageNumber: number, isNewSearch = false) => {
      setIsLoading(true);
      setError(null);
      try {
        // Se o termo de busca parece um CPF, usa o endpoint de busca segura.
        if (validateCpf(search)) {
          // Lógica de CPF
          const result = await patientService.searchPatientByCpf(search);

          // CORREÇÃO VISUAL: Se não achar nada pelo CPF, limpa a lista ou avisa
          if (result.length === 0) {
            setPatients([]);
            Swal.fire("Não Encontrado", "Nenhum paciente encontrado com este CPF.", "info");
          } else {
            setPatients(result);
          }

          setHasMore(false);
          setPage(0);
        } else {
          // Caso contrário, usa a busca geral paginada.
          const response = await patientService.getPatients({
            page: pageNumber,
            size: 8,
            search,
          });
          setPatients((prev) =>
            isNewSearch ? response.content : [...prev, ...response.content]
          );
          setHasMore(!response.last);
          setPage(pageNumber);
        }
      } catch (error: unknown) {
        const mensagemDoBackend =
          error instanceof ApiError
            ? error.message
            : "Não foi possível carregar os pacientes.";

        Swal.fire("Erro ao Carregar", mensagemDoBackend, "error");
        setError(mensagemDoBackend);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Adiciona um novo paciente.
   * Recebe os dados do formulário e converte a data.
   */
  const addPatient = async (formData: PatientFormData) => {
    setIsLoading(true);
    try {
      // Converte a data do formulário para o formato da API (ISO)
      const apiData: NewPatientData = {
        ...formData,
        birthDate: convertFormDateToISO(formData.birthDate),
      };

      const newPatient = await patientService.createPatient(apiData);
      setPatients((prev) => [newPatient, ...prev]);
      // Recarrega os dados para refletir a adição na paginação correta
      fetchPatients(searchTerm, 0, true);
      Swal.fire("Sucesso", "Paciente cadastrado com sucesso!", "success");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Falha ao cadastrar paciente.";

      setError(errorMessage);
      Swal.fire("Erro ao Cadastrar", errorMessage, "error");
      throw error; // Propaga o erro para o formulário
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove um paciente.
   */
  const removePatient = async (patientId: string) => {
    // (A confirmação com Swal é feita na UI)
    try {
      await patientService.deletePatient(patientId);
      // Recarrega os dados da página atual
      fetchPatients(debouncedSearchTerm, 0, true); // Recarrega do início após deletar
      Swal.fire("Sucesso", "Paciente deletado com sucesso.", "success");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Falha ao deletar paciente.";
      Swal.fire("Não foi possível deletar", errorMessage, "warning");
      setError(errorMessage);
    }
  };

  /**
   * Edita um paciente.
   * Recebe os dados do formulário e converte a data.
   */
  const editPatient = async (patientId: string, formData: PatientFormData) => {
    setIsLoading(true);
    try {
      // Converte a data do formulário para o formato da API (ISO)
      const apiData: UpdatePatientData = {
        ...formData,
        birthDate: convertFormDateToISO(formData.birthDate),
      };

      const updatedPatient = await patientService.updatePatient(
        patientId,
        apiData
      );
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? updatedPatient : p))
      );
      Swal.fire("Sucesso", "Paciente atualizado com sucesso!", "success");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Falha ao atualizar paciente.";

      setError(errorMessage);
      Swal.fire("Erro ao Atualizar", errorMessage, "error");
      throw error; // Propaga o erro
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carrega a próxima página de resultados (para scroll infinito).
   */
  const loadMorePatients = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchPatients(debouncedSearchTerm, page + 1);
    }
  }, [isLoading, hasMore, debouncedSearchTerm, page, fetchPatients]);

  // Efeito para buscar os dados sempre que a página ou a busca mudarem
  useEffect(() => {
    // Se o termo de busca mudou, reseta para a primeira página (página 0)
    fetchPatients(debouncedSearchTerm, 0, true);
  }, [debouncedSearchTerm, fetchPatients]);

  return {
    patients,
    isLoading,
    error,
    hasMore,
    // Controle de busca
    searchTerm,
    setSearchTerm,
    // Scroll Infinito
    loadMorePatients,
    reloadPatients: () => fetchPatients(debouncedSearchTerm, 0, true),
    // Funções de CRUD
    addPatient,
    removePatient,
    editPatient,
  };
};
