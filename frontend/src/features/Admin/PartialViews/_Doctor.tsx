import React, { useState } from 'react';

// --- Imports de Lógica ---
import { useDoctors } from '../doctors/hooks/useDoctors';
import type { Doctor, NewDoctorData } from '../doctors/types/doctor.type';

// --- Imports de UI ---
import styles from '../AdminDashboard.module.scss';
import { DoctorAdmin } from '../doctors/DoctorAdmin';
import { DoctorForm } from '../doctors/components/DoctorForm';
import { Modal } from '../../../components/Modal/Modal';

export const _DoctorPartial: React.FC = () => {
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
        {/* O H1 foi para o componente pai (index) */}
        {/* O botão de "Adicionar" agora vive dentro da parcial */}
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