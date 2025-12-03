import React, { useState, useMemo, useCallback } from 'react';
import styles from './SlotGenerationForm.module.scss';
import Swal from 'sweetalert2';
import { useSlotManagement } from '../../hooks/useSlotManagement';
import AuthForm from '../../../../../../components/Form/AuthForm';
import { FormField } from '../../../../../../components/Form/types/form.type';


interface SlotGenerationFormProps {
  onSuccess: (medicoId: string) => void; // Callback para avisar o pai que acabou
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
    duracao: '30' // Valor padrão
  });

  // Função auxiliar para atualizar o estado vindo do AuthForm
  const updateField = useCallback((name: keyof FormDataState, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: String(value) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    // Validações Básicas
    if (!formData.medicoId) {
      Swal.fire('Atenção', 'Informe o ID do médico.', 'warning');
      return;
    }
    if (!formData.inicio || !formData.fim) {
      Swal.fire('Atenção', 'Preencha as datas de início e fim.', 'warning');
      return;
    }

    // Chama o hook de geração
    const success = await generateAgenda({
      medicoId: formData.medicoId,
      inicio: formData.inicio, // Input datetime-local já envia no formato ISO correto
      fim: formData.fim,
      duracaoMinutos: Number(formData.duracao),
    });

    if (success) {
      Swal.fire('Sucesso', 'Agenda gerada com sucesso!', 'success');
      onSuccess(formData.medicoId); // Avisa a página pai e envia o ID do médico
    }
  };

  // Opções do Select
  const durationOptions = useMemo(() => [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '60 min' },
  ], []);

  // Definição dos campos para o AuthForm Genérico
  const fields: FormField[] = useMemo(() => [
    {
      elementType: 'input',
      type: 'text',
      name: 'medicoId',
      label: 'ID do Médico',
      placeholder: 'Digite ou cole o ID',
      value: formData.medicoId,
      required: true,
      onChange: (val) => updateField('medicoId', val),
    },
    {
      elementType: 'input',
      // O segredo para aparecer data E hora é este type
      type: 'datetime-local', 
      name: 'inicio',
      label: 'Início da Agenda',
      placeholder: '',
      value: formData.inicio,
      required: true,
      onChange: (val) => updateField('inicio', val),
    },
    {
      elementType: 'input',
      type: 'datetime-local',
      name: 'fim',
      label: 'Fim da Agenda',
      placeholder: '',
      value: formData.fim,
      required: true,
      onChange: (val) => updateField('fim', val),
    },
    {
      elementType: 'select',
      name: 'duracao',
      label: 'Duração da Consulta',
      value: formData.duracao,
      options: durationOptions,
      required: true,
      onChange: (val) => updateField('duracao', val),
    }
  ], [formData, durationOptions, updateField]);

  return (
    <div className={styles.slotFormContainer}>
      <h3 className={styles.formTitle}>Configurar Lote de Horários</h3>
      
      {error && (
        <div className={styles.errorAlert}>
          {error}
          <button onClick={clearError} className={styles.closeButton}>&times;</button>
        </div>
      )}

      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText="Gerar Agenda"
      />
    </div>
  );
};