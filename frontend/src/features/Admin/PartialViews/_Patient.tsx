import React, { useState } from 'react';

// --- Imports de Lógica ---
import { usePatients } from '../Patient/hooks/usePatients';     
import type { Patient, PatientFormData } from '../Patient/types/patient.types';     

// --- Imports de UI ---
import styles from '../AdminDashboard.module.scss';
import { PatientAdmin } from '../Patient/PatientAdmin';     
import { PatientForm } from '../Patient/components/PatientForm';    
import { Modal } from '../../../components/Modal';

export const _PatientPartial: React.FC = () => {
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

  return (
    <>
      <header className={styles.adminHeader}>
        <button onClick={handleOpenCreatePatientModal} className={styles.addButton}>
          Adicionar Paciente
        </button>
      </header>

      {/* Conteúdo da Aba */}
      <PatientAdmin
        patients={patients}
        isLoading={isLoadingPatients}
        error={errorPatients}
        onEditPatient={handleOpenEditPatientModal}
        onDeletePatient={handleDeletePatient}
      />

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
    </>
  );
};