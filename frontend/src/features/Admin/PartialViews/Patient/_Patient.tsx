import React, { useState } from 'react';

// --- Imports de Lógica ---


// --- Imports de UI ---
import styles from './_PatientPartial.module.scss';
import { Modal } from '../../../../components/Modal/Modal';
import { PatientForm } from '../../components/Patient/components/PatientForm';
import { usePatients } from '../../components/Patient/hooks/usePatients';
import { PatientAdmin } from '../../components/Patient/PatientAdmin';
import { Patient, PatientFormData } from '../../components/Patient/types/patient.types';


export const PatientPartial: React.FC = () => {
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
        await editPatient(editingPatient.id.toString(), data);
      } else {
        await addPatient(data);
      }
      handleClosePatientModal();
    } catch (error) { 
      console.error('Falha ao salvar paciente, modal não será fechado.', error);
    }
  };

  const handleDeletePatient = (patient: Patient) => { 
    removePatient(patient.id.toString());
  };

  return (
    
      <div className={styles.patientContainer}> 
      
      <header className={styles.header}> {/* Use a classe header */}
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
        
        // --- CORREÇÃO: Adicionadas as props obrigatórias de paginação ---
        hasMore={false}
        loadMorePatients={() => {}}
        onSearch={() => {}}
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
      </div>
  );
};