import React, { useState, useMemo, useCallback } from 'react';
import styles from './SlotGenerationForm.module.scss';
import Swal from 'sweetalert2';
import { useSlotManagement } from '../../hooks/useSlotManagement';
import AuthForm from '../../../../../../components/Form/AuthForm';
import { FormField } from '../../../../../../components/Form/types/form.type';
import { FormSelectOption } from '../../../appointment/types/appointment.type';

interface SlotGenerationFormProps {
  onSuccess: (medicoId: string) => void;
}

interface FormDataState {
  medicoId: string;
  inicio: string;
  fim: string;
  duracao: string;
}

export const SlotGenerationForm: React.FC<SlotGenerationFormProps> = ({ onSuccess }) => {
  const { generateAgenda, isLoading, error, clearError } = useSlotManagement();
  
  const [formData, setFormData] = useState<FormDataState>({
    medicoId: '',
    inicio: '',
    fim: '',
    duracao: '30'
  });

  // Helper para atualizar o estado. 
  // O AuthForm retorna o valor direto, então não precisamos de e.target
  const updateField = useCallback((name: keyof FormDataState, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: String(value) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // O AuthForm passa o evento, então prevenimos o reload
    
    // Validação
    if (!formData.medicoId) {
      Swal.fire('Atenção', 'Informe o ID do médico.', 'warning');
      return;
    }
    if (!formData.inicio || !formData.fim) {
      Swal.fire('Atenção', 'Preencha as datas de início e fim.', 'warning');
      return;
    }

    const success = await generateAgenda({
      medicoId: formData.medicoId,
      inicio: formData.inicio,
      fim: formData.fim,
      duracaoMinutos: Number(formData.duracao),
    });

    if (success) {
      Swal.fire('Sucesso', 'Agenda gerada com sucesso!', 'success');
      onSuccess(formData.medicoId);
    }
  };

  // Opções para o Select de Duração
  const durationOptions: FormSelectOption[] = useMemo(() => [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '60 min' },
  ], []);

  // Definição dos campos para o AuthForm
  const fields: FormField[] = useMemo(() => [
    {
      elementType: 'input',
      type: 'text',
      name: 'medicoId',
      label: 'ID do Médico',
      placeholder: 'Digite o ID do médico',
      value: formData.medicoId,
      required: true,
      onChange: (val) => updateField('medicoId', val), // AuthForm retorna string direto
    },
    {
      elementType: 'input',
      type: 'datetime-local', // Input nativo de data/hora
      name: 'inicio',
      label: 'Início',
      placeholder: '',
      value: formData.inicio,
      required: true,
      onChange: (val) => updateField('inicio', val),
    },
    {
      elementType: 'input',
      type: 'datetime-local',
      name: 'fim',
      label: 'Fim',
      placeholder: '',
      value: formData.fim,
      required: true,
      onChange: (val) => updateField('fim', val),
    },
    {
      elementType: 'select',
      name: 'duracao',
      label: 'Duração (min)',
      value: formData.duracao,
      options: durationOptions,
      required: true,
      onChange: (val) => updateField('duracao', val),
    }
  ], [formData, durationOptions, updateField]);

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Gerar Disponibilidade (Lote)</h3>
      
      {/* Exibição de Erro externa ao Form */}
      {error && (
        <div className={styles.errorAlert}>
          {error}
          <button onClick={clearError} className={styles.closeButton}>&times;</button>
        </div>
      )}

      {/* Componente Genérico substituindo o form HTML manual */}
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText="Gerar Agenda"
      />
    </div>
  );
};