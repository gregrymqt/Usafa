import { useState, useCallback, useEffect } from 'react';
import type {
  Patient,
  PatientFormData,
  NewPatientData,
  UpdatePatientData,
} from '../types/patient.types';
import * as patientService from '../services/patient.service';
import { showErrorToast, showSuccessToast } from '../../utils/adminUtils';

/**
 * Converte a data do formulário (YYYY-MM-DD) para ISO string UTC.
 */
const convertFormDateToISO = (dateString: string): string => {
  if (!dateString) return '';
  // Garante que a data seja tratada como UTC
  return `${dateString}T00:00:00Z`;
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os pacientes da API.
   */
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message);
      showErrorToast('Não foi possível carregar os pacientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      showSuccessToast('Paciente cadastrado com sucesso!');
    } catch (err: any)
      setError(err.message);
      showErrorToast(`Falha ao cadastrar paciente: ${err.message}`);
      throw err; // Propaga o erro para o formulário
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove um paciente.
   */
  const removePatient = async (id: number | string) => {
    // (A confirmação com Swal é feita na UI)
    try {
      await patientService.deletePatient(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      showSuccessToast('Paciente deletado com sucesso.');
    } catch (err: any) {
      setError(err.message);
      showErrorToast(`Falha ao deletar paciente: ${err.message}`);
    }
  };

  /**
   * Edita um paciente.
   * Recebe os dados do formulário e converte a data.
   */
  const editPatient = async (
    id: number | string,
    formData: PatientFormData
  ) => {
    setIsLoading(true);
    try {
      // Converte a data do formulário para o formato da API (ISO)
      const apiData: UpdatePatientData = {
        ...formData,
        birthDate: convertFormDateToISO(formData.birthDate),
      };

      const updatedPatient = await patientService.updatePatient(id, apiData);
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? updatedPatient : p))
      );
      showSuccessToast('Paciente atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message);
      showErrorToast(`Falha ao atualizar paciente: ${err.message}`);
      throw err; // Propaga o erro
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito inicial para carregar os dados
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    isLoading,
    error,
    fetchPatients,
    addPatient,
    removePatient,
    editPatient,
  };
};