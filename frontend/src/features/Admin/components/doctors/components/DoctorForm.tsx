import React, { useState, useMemo } from 'react';
import AuthForm from '../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../components/Form/types/form.type';
import type { NewDoctorData, Doctor } from '../types/doctor.type';
import styles from './DoctorForm.module.scss';

interface DoctorFormProps {
  onSubmit: (data: NewDoctorData) => Promise<void>;
  onCancel: () => void;
  initialData?: Doctor | null;
  isLoading: boolean;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [crm, setCrm] = useState(initialData?.crm || '');
  const [specialty, setSpecialty] = useState(
    initialData?.specialty || 'Clínico Geral'
  );
  const [picture, setPicture] = useState(initialData?.picture || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Adiciona o campo picture aos dados a serem enviados
    const doctorData = { name, email, crm, specialty, picture };

    try {
      await onSubmit(doctorData);
    } catch (error) {
      // O erro já foi tratado (toast) pelo hook,
      // mas impedimos que o formulário seja limpo/fechado
      console.error('Falha no submit, modal não será fechado.', error);
    }
  };

  // Memoiza a definição dos campos para o AuthForm
  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: 'input',
        type: 'text',
        name: 'name',
        label: 'Nome Completo',
        placeholder: 'Dr. Nome Sobrenome',
        value: name,
        onChange: (val) => setName(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'email@dominio.com',
        value: email,
        onChange: (val) => setEmail(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'crm',
        label: 'CRM',
        placeholder: 'CRM/SP 123456',
        value: crm,
        onChange: (val) => setCrm(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'picture',
        label: 'URL da Foto',
        placeholder: 'https://exemplo.com/foto.jpg',
        value: picture,
        onChange: (val) => setPicture(val as string),
        required: false, // A foto é opcional
      },
      {
        elementType: 'select',
        name: 'specialty',
        label: 'Especialidade',
        value: specialty,
        onChange: (val) => setSpecialty(val as string),
        options: [
          { value: 'Clínico Geral', label: 'Clínico Geral' },
          { value: 'Cardiologia', label: 'Cardiologia' },
          { value: 'Dermatologia', label: 'Dermatologia' },
          { value: 'Ortopedia', label: 'Ortopedia' },
        ],
      },
    ],
    [name, email, crm, specialty, picture]
  );

  return (
    <div className={styles.doctorForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? 'Atualizar' : 'Criar'}
      >
        {/* Botão Cancelar adicional, fora do AuthForm */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
      </AuthForm>
    </div>
  );
};