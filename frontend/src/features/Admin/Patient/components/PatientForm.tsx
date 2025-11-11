import React, { useState, useMemo } from 'react';
import AuthForm, {
  type FormField,
} from '../../../components/Form/AuthForm';
import type { NewPatientData, Patient } from '../types/patient.types';
import styles from './PatientForm.module.scss';

// Helper para formatar data (API envia ISO, input 'date' usa YYYY-MM-DD)
const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    return isoDate.split('T')[0];
  } catch (e) {
    return '';
  }
};

interface PatientFormProps {
  onSubmit: (data: NewPatientData) => Promise<void>;
  onCancel: () => void;
  initialData?: Patient | null;
  isLoading: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [cpf, setCpf] = useState(initialData?.cpf || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthDate, setBirthDate] = useState(
    formatDateForInput(initialData?.birthDate || '')
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // A API (hook) deve converter o YYYY-MM-DD para ISO string
    const patientData = { name, email, cpf, phone, birthDate };
    
    try {
      await onSubmit(patientData);
    } catch (error) {
      console.error('Falha no submit, modal não será fechado.', error);
    }
  };

  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: 'input',
        type: 'text',
        name: 'name',
        label: 'Nome Completo',
        placeholder: 'Nome Sobrenome',
        value: name,
        onChange: (val) => setName(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'paciente@email.com',
        value: email,
        onChange: (val) => setEmail(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'cpf',
        label: 'CPF',
        placeholder: '000.000.000-00',
        value: cpf,
        onChange: (val) => setCpf(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'tel',
        name: 'phone',
        label: 'Telefone',
        placeholder: '(11) 99999-8888',
        value: phone,
        onChange: (val) => setPhone(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'date',
        name: 'birthDate',
        label: 'Data de Nascimento',
        value: birthDate,
        onChange: (val) => setBirthDate(val as string),
        required: true,
      },
    ],
    [name, email, cpf, phone, birthDate]
  );

  return (
    <div className={styles.patientForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
      >
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