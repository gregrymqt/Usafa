import React, { useState, useMemo } from 'react';

// --- Imports de Lógica ---
import {
  useAppointments,
  splitDateTime,
} from '../appointment/hooks/useAppointments'; 
import { useDoctors } from '../doctors/hooks/useDoctors'; 
import { usePatients } from '../Patient/hooks/usePatients'; 
import type {
  AppointmentFormData,
  Appointment,
  FormSelectOption,
} from '../appointment/types/appointment.type'; 

// --- Imports de UI ---
import styles from '../AdminDashboard.module.scss';
import { AppointmentAdmin } from '../appointment/AppointmentAdmin';
import { AppointmentForm } from '../appointment/components/AppointmentForm/AppointmentForm';
import  { Modal } from '../../../components/Modal/Modal';

export const _AppointmentPartial: React.FC = () => {
  // --- Lógica de Consultas (Completa) ---
  const {
    appointments,
    isLoading: isLoadingAppointments,
    error: errorAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
  } = useAppointments();

  // Hooks para popular os selects do formulário
  const { doctors } = useDoctors();
  const { patients } = usePatients();

  // --- Estado do Modal ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | number | null
  >(null);
  const [editingAppointmentData, setEditingAppointmentData] =
    useState<AppointmentFormData | null>(null);

  // --- Opções para os Selects ---
  const doctorOptions: FormSelectOption[] = useMemo(() => {
    return doctors.map((doc) => ({
      value: doc.id,
      label: doc.name,
    }));
  }, [doctors]);

  const patientOptions: FormSelectOption[] = useMemo(() => {
    return patients.map((pat) => ({
      value: pat.id,
      label: pat.name,
    }));
  }, [patients]);

  // --- Manipuladores de Modal (Consulta) ---
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenEditAppointmentModal = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    const { date, time } = splitDateTime(appointment.date);
    setEditingAppointmentData({
      patientId: String(appointment.patient.id),
      doctorId: String(appointment.doctor.id),
      date: date,
      time: time,
      status: appointment.status,
    });
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
  };

  const handleAppointmentFormSubmit = async (data: AppointmentFormData) => { 
    try {
      if (editingAppointmentId) {
        await editAppointment(editingAppointmentId, data);
      } else {
        await addAppointment(data);
      }
      handleCloseAppointmentModal();
    } catch (error) {
      console.error('Falha ao salvar consulta, modal não será fechado.', error);
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => { 
    removeAppointment(appointment.id);
  };

  return (
    <>
      <header className={styles.adminHeader}>
        <button onClick={handleOpenCreateAppointmentModal} className={styles.addButton}>
          Agendar Consulta
        </button>
      </header>

      {/* Conteúdo da Aba */}
      <AppointmentAdmin
        appointments={appointments}
        isLoading={isLoadingAppointments}
        error={errorAppointments}
        onEditAppointment={handleOpenEditAppointmentModal}
        onDeleteAppointment={handleDeleteAppointment}
      />

      {/* Modal de Consultas */}
      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal} 
        title={
          editingAppointmentId ? 'Atualizar Consulta' : 'Agendar Nova Consulta' 
        }
      >
        <AppointmentForm
          onSubmit={handleAppointmentFormSubmit}
          onCancel={handleCloseAppointmentModal}
          initialData={editingAppointmentData}
          isLoading={isLoadingAppointments}
          doctorOptions={doctorOptions}
         patientOptions={patientOptions} 
        />
      </Modal>
    </>
  );
};