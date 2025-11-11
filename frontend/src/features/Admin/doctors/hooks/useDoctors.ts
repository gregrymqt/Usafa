import { useState, useCallback, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../utils/adminUtils";
import type { Doctor, NewDoctorData, UpdateDoctorData } from "../types/doctor.type";
import * as doctorService from "../services/doctor.service";
import { ApiError } from "../../../../shared/exceptions/ApiError";


export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os médicos da API.
   */
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getDoctors();
      setDoctors(data);
    } catch (err) {
      if( err instanceof ApiError){
      setError(err.message);
      showErrorToast('Não foi possível carregar os médicos.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Adiciona um novo médico.
   */
  const addDoctor = async (doctorData: NewDoctorData) => {
    setIsLoading(true);
    try {
      const newDoctor = await doctorService.createDoctor(doctorData);
      setDoctors((prev) => [newDoctor, ...prev]); // Adiciona no topo da lista
      showSuccessToast('Médico criado com sucesso!');
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

  // Efeito inicial para carregar os dados
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    isLoading,
    error,
    fetchDoctors,
    addDoctor,
    removeDoctor,
    editDoctor,
  };
};