import React, { useState } from 'react';
import { type ConsultaFormOptions, type ConsultaRequest } from '../../types/consulta.types';
import styles from './ConsultaForm.module.scss';
import type { FormField } from '../../../../components/Form/AuthForm';
import AuthForm from '../../../../components/Form/AuthForm';

interface ConsultaFormProps {
  options: ConsultaFormOptions;
  isSubmitting: boolean;
  onSubmit: (request: ConsultaRequest) => Promise<void>;
}

export const ConsultaForm: React.FC<ConsultaFormProps> = ({ options, isSubmitting, onSubmit }) => {
  
  // Estado interno do formulário
  const [formData, setFormData] = useState<ConsultaRequest>({
    medicoId: '',
    tipoId: '',
    dia: '',
    horario: '',
    sintomas: ''
  });

  const handleChange = (field: keyof ConsultaRequest, value: string | number) => {
    setFormData((prev: ConsultaRequest) => ({
      ...prev,
      [field]: String(value) // Garante que é string
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
    // Limpa o form após o envio (opcional)
    setFormData({
      medicoId: '',
      tipoId: '',
      dia: '',
      horario: '',
      sintomas: ''
    });
  };

  // Constrói os campos para o seu AuthForm
  // Todos são 'select' ou 'textarea' como pedido
  const fields: FormField[] = [
    {
      elementType: 'select',
      name: 'medicoId',
      label: 'Médico',
      value: formData.medicoId,
      onChange: (val: string | number) => handleChange('medicoId', val),
      options: options.medicos,
      required: true,
    },
    {
      elementType: 'select',
      name: 'tipoId',
      label: 'Tipo de Consulta',
      value: formData.tipoId,
      onChange: (val: string | number) => handleChange('tipoId', val),
      options: options.tipos,
      required: true,
    },
    {
      elementType: 'select',
      name: 'dia',
      label: 'Dia',
      value: formData.dia,
      onChange: (val: string | number) => handleChange('dia', val),
      options: options.dias,
      required: true,
    },
    {
      elementType: 'select',
      name: 'horario',
      label: 'Horário',
      value: formData.horario,
      onChange: (val: string | number) => handleChange('horario', val),
      options: options.horarios,
      required: true,
    },
    {
      elementType: 'textarea',
      name: 'sintomas',
      label: 'Sintomas (Opcional)',
      placeholder: 'Descreva brevemente seus sintomas...',
      value: formData.sintomas,
      onChange: (val: string | number) => handleChange('sintomas', val),
    }
  ];

  return (
    <section className={styles.consultaFormSection}>
      <h2>Marcar Nova Consulta</h2>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isSubmitting}
        buttonText="Enviar Solicitação"
      />
    </section>
  );
};