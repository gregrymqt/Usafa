// src/features/Admin/TipoConsulta/hooks/useAppointmentType.ts
import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { appointmentTypeService } from '../services/appointmentType.service';
import { TipoConsulta } from '../types/appointmentType.type';
import { FormField } from '../../../../../components/Form/types/form.type';

export const useAppointmentType = () => {
  // --- Estados ---
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [tipos, setTipos] = useState<TipoConsulta[]>([]);
  const [editingItem, setEditingItem] = useState<TipoConsulta | null>(null);
  const [formData, setFormData] = useState({ nome: '' });

  // --- Ações ---

  const fetchTipos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await appointmentTypeService.getAll();
      setTipos(data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Não foi possível carregar os tipos de consulta.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (publicId: string) => {
    setIsLoading(true);
    try {
      await appointmentTypeService.delete(publicId);
      await fetchTipos();
      // Opcional: Feedback visual de deleção, se desejar
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao deletar o registro.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSetup = (item: TipoConsulta) => {
    setEditingItem(item);
    setFormData({ nome: item.nome });
    setActiveTab('form');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({ nome: '' });
    setActiveTab('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingItem) {
        await appointmentTypeService.update(editingItem.publicId, formData.nome);
        Swal.fire('Sucesso', 'Tipo de consulta atualizado!', 'success');
      } else {
        await appointmentTypeService.create(formData.nome);
        Swal.fire('Sucesso', 'Tipo de consulta criado!', 'success');
      }

      handleCancelEdit(); // Reseta e volta para lista
      fetchTipos();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao salvar os dados.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Configurações ---

  // Definimos os campos do formulário aqui para limpar a View
  const formFields: FormField[] = [
    {
      name: 'nome',
      label: 'Nome da Especialidade',
      elementType: 'input',
      type: 'text',
      placeholder: 'Ex: Cardiologia, Dermatologia...',
      required: true,
      value: formData.nome,
      onChange: (val) => setFormData(prev => ({ ...prev, nome: val })),
    }
  ];

  // Inicialização
  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  return {
    // State
    activeTab,
    setActiveTab,
    isLoading,
    tipos,
    editingItem,
    
    // Actions
    handleDelete,
    handleEditSetup,
    handleCancelEdit,
    handleSubmit,
    
    // Configs
    formFields
  };
};