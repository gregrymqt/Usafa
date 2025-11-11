import React, { useState } from 'react';

import styles from './AdminDashboard.module.scss';
import type { Modal } from '../../components/Modal';
import { AppointmentAdmin } from './appointment/AppointmentAdmin';
import { DoctorForm } from './doctors/components/DoctorForm';
import { DoctorAdmin } from './doctors/DoctorAdmin';
import { useDoctors } from './doctors/hooks/useDoctors';
import type { Doctor, NewDoctorData } from './doctors/types/doctor.type';
import { PatientAdmin } from './Patient/PatientAdmin';

// Definindo os tipos de abas
type AdminTab = 'doctors' | 'patients' | 'appointments';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors');

  // --- Lógica de Médicos ---
  // O hook agora vive aqui, no componente pai
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

  // --- Lógica de Pacientes (Placeholder) ---
  // const { patients, isLoading: isLoadingPatients, ... } = usePatients();
  // const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // --- Lógica de Consultas (Placeholder) ---
  // const { appointments, ... } = useAppointments();
  // const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);


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
    if (editingDoctor) {
      await editDoctor(editingDoctor.id, data);
    } else {
      await addDoctor(data);
    }
    handleCloseDoctorModal(); // Fecha o modal em caso de sucesso
  };
  
  const handleDeleteDoctor = (doctor: Doctor) => {
    // A confirmação (Swal) já está no DoctorAdmin, 
    // mas a chamada final ao hook é feita aqui.
    // Ah, espera, mudei o DoctorAdmin. Vamos chamar o hook aqui.
    removeDoctor(doctor.id);
  };

  // --- Manipulador do Botão Principal "Adicionar" ---
  const handleAddClick = () => {
    switch (activeTab) {
      case 'doctors':
        handleOpenCreateDoctorModal();
        break;
      case 'patients':
        // setIsPatientModalOpen(true);
        alert('Abrir modal de Pacientes (não implementado)');
        break;
      case 'appointments':
        // setIsAppointmentModalOpen(true);
        alert('Abrir modal de Consultas (não implementado)');
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
            onDeleteDoctor={handleDeleteDoctor} // Passando a função de deleção
          />
        );
      case 'patients':
        return <PatientAdmin />;
      case 'appointments':
        return <AppointmentAdmin />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <h1 className={styles.title}>Painel do Admin</h1>
        <button onClick={handleAddClick} className={styles.addButton}>
          {/* O texto do botão pode mudar com a aba */}
          {activeTab === 'doctors' && 'Adicionar Médico'}
          {activeTab === 'patients' && 'Adicionar Paciente'}
          {activeTab === 'appointments' && 'Agendar Consulta'}
        </button>
      </header>

      {/* Navegação por Abas (Tabs) */}
      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'doctors' ? styles.active : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Médicos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'patients' ? styles.active : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          Pacientes
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'appointments' ? styles.active : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Consultas
        </button>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <main>
        {renderActiveTabContent()}
      </main>

      {/* Modal de Médicos (controlado por este componente) */}
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

      {/* TODO: Adicionar Modal de Pacientes */}
      {/* <Modal isOpen={isPatientModalOpen} ... > ... </Modal> */}

      {/* TODO: Adicionar Modal de Consultas */}
      {/* <Modal isOpen={isAppointmentModalOpen} ... > ... </Modal> */}
    </div>
  );
};