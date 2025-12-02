import React, { useState } from 'react';

// --- Imports de Lógica ---
import { usePatients } from '../../components/Patient/hooks/usePatients';

// --- Imports de UI ---
import styles from './_PatientPartial.module.scss';
import { Modal } from '../../../../components/Modal/Modal';
import { PatientForm } from '../../components/Patient/components/Form/PatientForm';
import { Patient, PatientFormData } from '../../components/Patient/types/patient.type';
import { PasswordTokenManager } from '../../components/Patient/components/Token/PasswordTokenManager';
import { PatientAdmin } from '../../components/Patient/PatientAdmin';


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

  // --- Lógica de UI ---
  const [activeTab, setActiveTab] = useState<'patients' | 'tokens'>('patients');

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
    <div className={styles.container}>
      {/* --- Navegação por Abas --- */}
      <nav className={styles.tabNav}>
        <button
          onClick={() => setActiveTab('patients')}
          className={`${styles.tabButton} ${activeTab === 'patients' ? styles.active : ''}`}
        >
          Gerenciar Pacientes
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`${styles.tabButton} ${activeTab === 'tokens' ? styles.active : ''}`}
        >
          Gerenciar Tokens de Senha
        </button>
      </nav>

      {/* --- Conteúdo da Aba Ativa --- */}
      <div className={styles.tabContent}>
        {activeTab === 'patients' && (
          <>
            <header className={styles.header}>
              <button onClick={handleOpenCreatePatientModal} className={styles.addButton}>
                Adicionar Paciente
              </button>
            </header>
            <PatientAdmin
              patients={patients}
              isLoading={isLoadingPatients}
              error={errorPatients}
              onEditPatient={handleOpenEditPatientModal}
              onDeletePatient={handleDeletePatient}
              hasMore={false} // Mock para paginação
              loadMorePatients={() => {}} // Mock para paginação
              onSearch={() => {}} // Mock para busca
            />
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
        )}

        {activeTab === 'tokens' && <PasswordTokenManager />}
      </div>
    </div>
  );
};