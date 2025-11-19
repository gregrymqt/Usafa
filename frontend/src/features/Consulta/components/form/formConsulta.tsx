import React, { useState } from 'react';
// Importamos 'Omit' para dizer que o formulário não sabe o 'patientId' (o hook que sabe)
import { type ConsultaRequest } from '../../types/consulta.types'; 
import styles from './ConsultaForm.module.scss';
import AuthForm from '../../../../components/Form/AuthForm';
import type { FormField } from '../../../../components/Form/types/form.type';
import type { ConsultaFormProps } from './types/ConsultaForm.type';

// Tipo local para o estado do formulário (tudo menos o patientId)
type ConsultaFormState = Omit<ConsultaRequest, 'patientId'>;

export const ConsultaForm: React.FC<ConsultaFormProps> = ({ options, isSubmitting, onSubmit }) => {
  
  // Estado inicial atualizado [cite: 22]
  const [formData, setFormData] = useState<Partial<ConsultaFormState>>({
    tipoConsultaId: '',     // Substitui tipoId
    horarioSlotId: undefined, // Substitui dia/horario/medico
    sintomas: ''
  });

  // Manipulador de mudanças genérico [cite: 23]
  const handleChange = (field: keyof ConsultaFormState, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validamos se os campos obrigatórios estão preenchidos
    if (formData.tipoConsultaId && formData.horarioSlotId) {
      // Convertemos para o tipo esperado (cast seguro pois validamos acima)
      await onSubmit(formData as unknown as ConsultaRequest); 
      
      // Limpa o form [cite: 25]
      setFormData({
        tipoConsultaId: '',
        horarioSlotId: undefined,
        sintomas: ''
      });
    }
  };

  const fields: FormField[] = [
    {
      elementType: 'select',
      name: 'tipoConsultaId', // [cite: 27]
      label: 'Especialidade / Tipo',
      value: formData.tipoConsultaId || '',
      onChange: (val) => handleChange('tipoConsultaId', val),
      options: options.tipos,
      required: true,
    },
    {
      elementType: 'select',
      name: 'horarioSlotId', // NOVO: Substitui Médico, Dia e Horário
      label: 'Horários Disponíveis',
      value: formData.horarioSlotId || '',
      onChange: (val) => handleChange('horarioSlotId', Number(val)), // Converte para number (Long no Java)
      options: options.horarios, // Vem do mapper.slotsToOptions() do backend
      required: true,
      placeholder: 'Selecione data e médico...'
    },
    {
      elementType: 'textarea',
      name: 'sintomas', // [cite: 29]
      label: 'Sintomas (Opcional)',
      placeholder: 'Descreva brevemente seus sintomas...',
      value: formData.sintomas || '',
      onChange: (val) => handleChange('sintomas', val),
    }
  ];

  return (
    <section className={styles.consultaFormSection}>
      <h2>Marcar Nova Consulta</h2>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isSubmitting}
        buttonText="Agendar Consulta"
      />
    </section>
  );
};