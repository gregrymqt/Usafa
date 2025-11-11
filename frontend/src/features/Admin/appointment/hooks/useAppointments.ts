import { useState, useCallback, useEffect } from 'react';
import type { showErrorToast, showSuccessToast } from '../../utils/adminUtils';
import type { Appointment, AppointmentFormData, NewAppointmentData, UpdateAppointmentData } from '../types/appointment.type';
import * as appointmentService from '../services/appointment.service';


/**
 * Combina data (YYYY-MM-DD) e hora (HH:MM) em um ISO string.
 * @param date Data no formato YYYY-MM-DD
 * @param time Hora no formato HH:MM
 * @returns Data e hora como ISO string (UTC)
 */
const combineDateTime = (date: string, time: string): string => {
  try {
    // Cria a data no fuso horário local
    const localDateTime = new Date(`${date}T${time}:00`);
    // Converte para ISO string (geralmente UTC)
    return localDateTime.toISOString();
  } catch (e) {
    console.error('Data ou hora inválida:', e);
    return new Date().toISOString(); // Fallback
  }
};

/**
 * Divide um ISO string em data (YYYY-MM-DD) e hora (HH:MM).
 * @param isoString Data e hora como ISO string
 * @returns Objeto com { date, time }
 */
export const splitDateTime = (isoString: string): { date: string; time: string } => {
  try {
    const dateObj = new Date(isoString);
    // Formata para YYYY-MM-DD (cuidado com fuso horário)
    const date = dateObj.toLocaleDateString('en-CA'); // 'en-CA' usa YYYY-MM-DD
    // Formata para HH:MM
    const time = dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return { date, time };
  } catch (e) {
    return { date: '', time: '' };
  }
}

// --- Hook Principal ---

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca as consultas da API.
   */
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
      showErrorToast('Não foi possível carregar as consultas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Adiciona uma nova consulta.
   * Recebe os dados do formulário e os converte.
   */
  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Converte data/hora do formulário para o formato da API
      const newAppointmentData: NewAppointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        status: formData.status,
        dateTime: combineDateTime(formData.date, formData.time),
      };

      const newAppointment = await appointmentService.createAppointment(
        newAppointmentData
      );
      setAppointments((prev) => [newAppointment, ...prev]);
      showSuccessToast('Consulta agendada com sucesso!');
    } catch (err: any) {
      setError(err.message);
      showErrorToast(`Falha ao agendar consulta: ${err.message}`);
      throw err; // Propaga o erro para o formulário
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove uma consulta.
   */
  const removeAppointment = async (id: number | string) => {
    // (A confirmação com Swal é feita na UI)
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      showSuccessToast('Consulta deletada com sucesso.');
    } catch (err: any) {
      setError(err.message);
      showErrorToast(`Falha ao deletar consulta: ${err.message}`);
    }
  };

  /**
   * Edita uma consulta.
   * Recebe os dados do formulário e os converte.
   */
  const editAppointment = async (
    id: number | string,
    formData: AppointmentFormData
  ) => {
    setIsLoading(true);
    try {
      // Converte data/hora
      const updateData: UpdateAppointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        status: formData.status,
        dateTime: combineDateTime(formData.date, formData.time),
      };

      const updatedAppointment = await appointmentService.updateAppointment(
        id,
        updateData
      );
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updatedAppointment : a))
      );
      showSuccessToast('Consulta atualizada com sucesso!');
    } catch (err: any) {
      setError(err.message);
      showErrorToast(`Falha ao atualizar consulta: ${err.message}`);
      throw err; // Propaga o erro
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito inicial para carregar os dados
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
  };
};