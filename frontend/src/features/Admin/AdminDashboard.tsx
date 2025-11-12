import React, { useState, useMemo } from 'react';

import styles from './AdminDashboard.module.scss';
// Importa o Modal que será usado por todos
import { Modal } from '../../components/Modal';

// --- Lógica de Consultas (Agora completa) ---
import { AppointmentAdmin } from './appointment/AppointmentAdmin';
import {
  AppointmentForm,
  type FormSelectOption,
} from './appointment/components/AppointmentForm';
import {
  useAppointments,
  splitDateTime, // Helper para editar
} from './appointment/hooks/useAppointments';


// --- Lógica de Médicos ---
import { DoctorForm } from './doctors/components/DoctorForm';
import { DoctorAdmin } from './doctors/DoctorAdmin';
import { useDoctors } from './doctors/hooks/useDoctors';
import type { Doctor, NewDoctorData } from './doctors/types/doctor.type';

// --- Lógica de Pacientes ---
import { usePatients } from './Patient/hooks/usePatients';
import { PatientAdmin } from './Patient/PatientAdmin';
import { PatientForm } from './Patient/components/PatientForm';
import type { Patient, PatientFormData } from './Patient/types/patient.types';
import type { AppointmentFormData, Appointment } from './appointment/types/appointment.type';

// Definindo os tipos de abas
type AdminTab = 'doctors' | 'patients' | 'appointments';

 const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors');

  // --- Lógica de Médicos (Completa) ---
  const {
    doctors,
    isLoading: isLoadingDoctors,
    error: errorDoctors,
    addDoctor,
    removeDoctor,
    editDoctor,
  } = useDoctors();

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // --- Lógica de Pacientes (Completa) ---
  const {
    patients,
    isLoading: isLoadingPatients,
    error: errorPatients,
    addPatient,
    removePatient,
    editPatient,
  } = usePatients();

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  //--- Lógica de Consultas (Agora completa) ---
  const {
    appointments,
    isLoading: isLoadingAppointments,
    error: errorAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
  } = useAppointments();

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  // O formulário usa 'AppointmentFormData', mas a lista nos dá 'Appointment'
  // Vamos guardar o ID e o 'editingData' formatado para o formulário
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | number | null
  >(null);
  const [editingAppointmentData, setEditingAppointmentData] =
    useState<AppointmentFormData | null>(null);

  // --- Opções para os Selects do Formulário de Consulta ---
  // Usamos useMemo para não recalcular a cada renderização
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

  // --- Manipuladores de Modal (Médico) ---
  const handleOpenCreateDoctorModal = () => {
    setEditingDoctor(null);
    setIsDoctorModalOpen(true);
  };
  const handleOpenEditDoctorModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDoctorModalOpen(true);
  };
  const handleCloseDoctorModal = () => {
    setIsDoctorModalOpen(false);
    setEditingDoctor(null);
  };
  const handleDoctorFormSubmit = async (data: NewDoctorData) => {
    try {
      if (editingDoctor) {
        await editDoctor(editingDoctor.id, data);
      } else {
        await addDoctor(data);
      }
      handleCloseDoctorModal();
    } catch (error) {
      console.error('Falha ao salvar médico, modal não será fechado.', error);
    }
  };
  const handleDeleteDoctor = (doctor: Doctor) => {
    removeDoctor(doctor.id);
  };

  // --- Manipuladores de Modal (Paciente) ---
  const handleOpenCreatePatientModal = () => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  };
  const handleOpenEditPatientModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientModalOpen(true);
  };
  const handleClosePatientModal = () => {
    setIsPatientModalOpen(false);
    setEditingPatient(null);
  };
  const handlePatientFormSubmit = async (data: PatientFormData) => {
    try {
      if (editingPatient) {
        await editPatient(editingPatient.id, data);
      } else {
        await addPatient(data);
      }
      handleClosePatientModal();
    } catch (error) {
      console.error('Falha ao salvar paciente, modal não será fechado.', error);
    }
  };
  const handleDeletePatient = (patient: Patient) => {
    removePatient(patient.id);
  };

  // --- Manipuladores de Modal (Consulta) ---
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null); // Limpa dados de edição
    setIsAppointmentModalOpen(true);
  };

  const handleOpenEditAppointmentModal = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.id);
    // Converte o objeto 'Appointment' para 'AppointmentFormData'
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
      handleCloseAppointmentModal(); // Fecha o modal em caso de sucesso
    } catch (error) {
      console.error('Falha ao salvar consulta, modal não será fechado.', error);
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    removeAppointment(appointment.id);
  };

  // --- Manipulador do Botão Principal "Adicionar" ---
  const handleAddClick = () => {
    switch (activeTab) {
      case 'doctors':
        handleOpenCreateDoctorModal();
        break;
      case 'patients':
        handleOpenCreatePatientModal();
        break;
      case 'appointments':
        handleOpenCreateAppointmentModal(); // Conectado!
        break;
    }
  };

  // --- Renderização ---

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'doctors':
        return (
          <DoctorAdmin
            doctors={doctors}
            isLoading={isLoadingDoctors}
            error={errorDoctors}
            onEditDoctor={handleOpenEditDoctorModal}
            onDeleteDoctor={handleDeleteDoctor}
          />
        );
      case 'patients':
        return (
          <PatientAdmin
            patients={patients}
            isLoading={isLoadingPatients}
            error={errorPatients}
            onEditPatient={handleOpenEditPatientModal}
            onDeletePatient={handleDeletePatient}
          />
        );
      case 'appointments':
        return (
          <AppointmentAdmin
            appointments={appointments}
            isLoading={isLoadingAppointments}
            error={errorAppointments}
            onEditAppointment={handleOpenEditAppointmentModal}
            onDeleteAppointment={handleDeleteAppointment}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.title}>Painel do Admin</h1>
        <button onClick={handleAddClick} className={styles.addButton}>
          {activeTab === 'doctors' && 'Adicionar Médico'}
          {activeTab === 'patients' && 'Adicionar Paciente'}
          {activeTab === 'appointments' && 'Agendar Consulta'}
        </button>
      </header>

      {/* Navegação por Abas (Tabs) */}
      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'doctors' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('doctors')}
        >
          Médicos
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'patients' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('patients')}
        >
          Pacientes
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'appointments' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('appointments')}
        >
          Consultas
        </button>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <main>{renderActiveTabContent()}</main>

      {/* Modal de Médicos */}
      <Modal
        isOpen={isDoctorModalOpen}
        onClose={handleCloseDoctorModal}
        title={editingDoctor ? 'Atualizar Médico' : 'Adicionar Novo Médico'}
      >
        <DoctorForm
          onSubmit={handleDoctorFormSubmit}
          onCancel={handleCloseDoctorModal}
          initialData={editingDoctor}
          isLoading={isLoadingDoctors}
        />
      </Modal>

      {/* Modal de Pacientes */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={handleClosePatientModal}
        title={editingPatient ? 'Atualizar Paciente' : 'Adicionar Novo Paciente'}
      >
        <PatientForm
          onSubmit={handlePatientFormSubmit}
          onCancel={handleClosePatientModal}
          initialData={editingPatient}
          isLoading={isLoadingPatients}
        />
      </Modal>

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
          // Passamos as listas de médicos e pacientes
          doctorOptions={doctorOptions}
          patientOptions={patientOptions}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;