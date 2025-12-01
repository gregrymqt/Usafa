import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { HomeContent } from '../types/homeAdmin.type';
import { homeService } from '../services/home.service';


export const useHomeAdmin = () => {
  const [items, setItems] = useState<HomeContent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const data = await homeService.getAll();
      setItems(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Falha ao carregar os conteúdos da home.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: HomeContent) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await homeService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      // Opcional: Notificação de sucesso
      // Swal.fire('Deletado!', 'O item foi removido.', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Ocorreu um erro ao deletar o item.', 'error');
    }
  };

  const handleFormSubmit = async (formData: Partial<HomeContent>) => {
    setIsLoading(true);
    try {
      if (editingItem) {
        const updated = await homeService.update(editingItem.id, formData);
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        Swal.fire('Sucesso!', 'Item atualizado com sucesso.', 'success');
      } else {
        // Validação para garantir que os campos obrigatórios para criação existem
        if (!formData.title || !formData.type) {
          Swal.fire('Erro', 'Título e Tipo são campos obrigatórios.', 'error');
          return;
        }

        // Agora o TS sabe que formData tem as propriedades necessárias para 'create'
        const created = await homeService.create(formData as Omit<HomeContent, 'id'>);
        setItems(prev => [...prev, created]);
        Swal.fire('Sucesso!', 'Novo item criado.', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      const action = editingItem ? 'atualizar' : 'criar';
      Swal.fire('Erro', `Falha ao ${action} o item.`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    items,
    isModalOpen,
    editingItem,
    isLoading,
    handleOpenCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeModal,
  };
};