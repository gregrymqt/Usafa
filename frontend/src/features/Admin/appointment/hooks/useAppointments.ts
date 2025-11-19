import { useState, useCallback, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../utils/adminUtils";
import type { Appointment, AppointmentFormData } from "../types/appointment.type";
import * as appointmentService from "../services/appointment.service";

// Removemos combineDateTime e splitDateTime pois não são mais necessários [cite: 61-71]

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Appointments (Mantém igual) [cite: 73-74]
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      if(err instanceof Error) {
        setError(err.message);
        showErrorToast('Não foi possível carregar as consultas.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adicionar Consulta (Atualizado para novo DTO)
  const addAppointment = async (formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Não precisamos converter datas. O formData já tem os IDs corretos.
      const newAppointment = await appointmentService.createAppointment(formData);
      
      setAppointments((prev) => [newAppointment, ...prev]);
      showSuccessToast('Consulta agendada com sucesso!');
      
      // Opcional: Recarregar slots disponíveis na tela pai se necessário
    } catch (err) {
      if(err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao agendar consulta: ${err.message}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Editar Consulta (Atualizado)
  const editAppointment = async (id: string, formData: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Envia o formData direto (patientId, horarioSlotId, tipoConsultaId, status)
      const updatedAppointment = await appointmentService.updateAppointment(id, formData);
      
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? updatedAppointment : a))
      );
      showSuccessToast('Consulta atualizada com sucesso!');
    } catch (err) {
      if(err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao atualizar consulta: ${err.message}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Appointment (Mantém igual) [cite: 81-85]
  const removeAppointment = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      showSuccessToast('Consulta deletada com sucesso.');
    } catch (err) {
      if(err instanceof Error) {
        setError(err.message);
        showErrorToast(`Falha ao deletar consulta: ${err.message}`);
      }
    }
  };

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