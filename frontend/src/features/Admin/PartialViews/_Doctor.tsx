import React, { useState } from 'react';

// --- Imports de Lógica ---
import { useDoctors } from '../components/doctors/hooks/useDoctors';
import type { Doctor, NewDoctorData } from '../components/doctors/types/doctor.type';

// --- Imports de UI ---
import styles from '../AdminDashboard.module.scss';
import { DoctorAdmin } from '../components/doctors/DoctorAdmin';
import { DoctorForm } from '../components/doctors/components/DoctorForm';
import { Modal } from '../../../components/Modal/Modal';

// CORREÇÃO 1: Removido o "_" do nome. Componentes devem ser PascalCase (Ex: DoctorPartial) para usar Hooks.
export const DoctorPartial: React.FC = () => {
  // --- Lógica de Médicos (Completa) ---
  const {
    doctors,
    isLoading: isLoadingDoctors,
    error: errorDoctors,
    addDoctor,
    removeDoctor,
    editDoctor,
    // Se o seu hook useDoctors já tiver paginação, desestruture 'hasMore' e 'loadMore' aqui.
    // Caso contrário, usaremos valores padrão abaixo.
  } = useDoctors(); 

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

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

  return (
    <>
      <header className={styles.adminHeader}>
        <button onClick={handleOpenCreateDoctorModal} className={styles.addButton}>
          Adicionar Médico
        </button>
      </header>

      {/* Conteúdo da Aba */}
      <DoctorAdmin
        doctors={doctors}
        isLoading={isLoadingDoctors}
        error={errorDoctors}
        onEditDoctor={handleOpenEditDoctorModal}
        onDeleteDoctor={handleDeleteDoctor}
        
        // CORREÇÃO 2: Adicionadas as props obrigatórias de paginação.
        // Como seu hook useDoctors atual não parece retornar isso, passamos valores "dummy" para compilar.
        hasMore={false} 
        loadMoreDoctors={() => {}} 
     /> 

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
    </>
  );
};