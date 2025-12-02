import React, { useState, useMemo } from 'react';

import type { NewPatientData, Patient } from '../../types/patient.type';
import styles from './PatientForm.module.scss'; // Importando os novos estilos
import AuthForm from '../../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../../components/Form/types/form.type';
import {
  validateEmail,
  validateCpf,
  validatePhone,
  validateCep,
} from '../../../../../../shared/utils/validators.utils';

// Helper para formatar data (API envia ISO, input 'date' usa YYYY-MM-DD)
const formatDateForInput = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    return isoDate.split('T')[0];
  } catch (e) {
    console.log('Error ao formatar a data', e)
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
  const [cep, setCep] = useState(initialData?.cep || '');
  const [birthDate, setBirthDate] = useState(
    formatDateForInput(initialData?.birthDate || '')
  );

  // Estados de erro para validação
  const [emailError, setEmailError] = useState<string | undefined>();
  const [cpfError, setCpfError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [cepError, setCepError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validação final antes do envio
    if (!validateEmail(email) || !validateCpf(cpf) || !validatePhone(phone) || !validateCep(cep)) {
      console.error("Formulário com dados inválidos.");
      return; // Impede o envio se houver erros
    }

    // A API (hook) deve converter o YYYY-MM-DD para ISO string
    const patientData = { name, email, cpf, phone, cep, birthDate };
    
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
        onChange: (val) => {
          const newEmail = val as string;
          setEmail(newEmail);
          setEmailError(
            validateEmail(newEmail) ? undefined : 'Formato de email inválido.'
          );
        },
        required: true,
        error: emailError,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'cpf',
        label: 'CPF',
        placeholder: '000.000.000-00',
        value: cpf,
        onChange: (val) => {
          const newCpf = val as string;
          setCpf(newCpf);
          setCpfError(
            validateCpf(newCpf) ? undefined : 'CPF inválido.'
          );
        },
        required: true,
        error: cpfError,
      },
      {
        elementType: 'input',
        type: 'tel',
        name: 'phone',
        label: 'Telefone',
        placeholder: '(11) 99999-8888',
        value: phone,
        onChange: (val) => {
          const newPhone = val as string;
          setPhone(newPhone);
          setPhoneError(
            validatePhone(newPhone) ? undefined : 'Telefone inválido.'
          );
        },
        required: true,
        error: phoneError,
      },
      {
        elementType: 'input',
        type: 'text',
        name: 'cep',
        label: 'CEP',
        placeholder: '00000-000',
        value: cep,
        onChange: (val) => {
          const newCep = val as string;
          setCep(newCep);
          setCepError(
            validateCep(newCep) ? undefined : 'CEP inválido (deve ter 8 dígitos).'
          );
        },
        required: true,
        error: cepError,
      },
      {
        elementType: 'input',
        type: 'date',
        name: 'birthDate',
        label: 'Data de Nascimento',
        value: birthDate,
        onChange: (val) => setBirthDate(val as string),
        required: true,
        placeholder: '', // <--- CORREÇÃO AQUI
      },
    ],
    [
      name,
      email,
      cpf,
      phone,
      cep,
      birthDate,
      emailError,
      cpfError,
      phoneError,
      cepError,
    ]
  );

  return (
    <div className={styles.patientForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText="" // Adicionado para satisfazer a prop obrigatória
        // O botão de submit agora é um filho explícito, então removemos buttonText
      >
        {/* Contêiner para os botões de ação */}
        <div className={styles.actions}>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Salvando...' : (initialData ? 'Atualizar Paciente' : 'Cadastrar Paciente')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </AuthForm>
    </div>
  );
};