import React, { useEffect, useState } from 'react';

import styles from './HomeAdmin.module.scss';
import Swal from 'sweetalert2';
import { Modal } from '../../../../components/Modal/Modal';
import HomeForm from './components/HomeForm/Homeform';
import HomeList from './components/HomeList/HomeList';
import { homeService } from './services/home.service';
import { HomeContent } from './types/homeAdmin.type';

const HomeAdmin: React.FC = () => {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados
  const fetchItems = async () => {
    try {
      const data = await homeService.getAll();
      setItems(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar dados', 'error');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: HomeContent) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    // A confirmação visual já está dentro do ActionMenu, aqui só executamos a lógica
    try {
      await homeService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao deletar item', 'error');
    }
  };

  const handleFormSubmit = async (formData: HomeContent) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        // Update
        const updated = await homeService.update(editingItem.id, formData);
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        Swal.fire('Sucesso', 'Item atualizado!', 'success');
      } else {
        // Create
        const created = await homeService.create(formData);
        setItems(prev => [...prev, created]);
        Swal.fire('Sucesso', 'Item criado!', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
        console.error(error);
      Swal.fire('Erro', 'Falha ao salvar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Editar Conteúdo" : "Novo Conteúdo"}
      >
        <HomeForm 
          initialData={editingItem}
          onSubmit={handleFormSubmit as (data: Partial<HomeContent>) => void}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
};

export default HomeAdmin;