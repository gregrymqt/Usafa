import React from 'react';
import styles from './HomeAdmin.module.scss';
import { Modal } from '../../../../components/Modal/Modal';
import HomeForm from './components/HomeForm/Homeform';
import HomeList from './components/HomeList/HomeList';
import type { HomeContent } from './types/homeAdmin.type';
import { useHomeAdmin } from './hooks/useHomeAdmin';

const HomeAdmin: React.FC = () => {
  const {
    items,
    isModalOpen,
    editingItem,
    isLoading,
    handleOpenCreate,
    handleEdit,
    handleDelete, 
    handleFormSubmit,
    closeModal,
  } = useHomeAdmin();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topBar}>
        <h1>Gestão da Home</h1>
        <button onClick={handleOpenCreate} className={styles.addButton}>
          + Novo Conteúdo
        </button>
      </div>

      <HomeList 
        data={items}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Editar Conteúdo" : "Novo Conteúdo"}
      >
        <HomeForm 
          initialData={editingItem}
          onSubmit={handleFormSubmit as (data: Partial<HomeContent>) => void}
          onCancel={closeModal}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
};

export default HomeAdmin;