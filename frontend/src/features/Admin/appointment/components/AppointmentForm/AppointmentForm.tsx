import React, { useState, useMemo } from 'react';
// Importando o AuthForm

import styles from './AppointmentForm.module.scss';
import AuthForm from '../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../components/Form/types/form.type';
import type { AppointmentFormProps } from './types/Appointment.types';

type StatusType = 'Agendada' | 'Concluída' | 'Cancelada';

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  doctorOptions,
  patientOptions,
}) => {
  // Estado para o formulário
  const [patientId, setPatientId] = useState(initialData?.patientId || '');
  const [doctorId, setDoctorId] = useState(initialData?.doctorId || '');
  const [date, setDate] = useState(initialData?.date || ''); // ex: "2023-10-25"
  const [time, setTime] = useState(initialData?.time || ''); // ex: "14:30"
  const [status, setStatus] = useState<StatusType>(initialData?.status || 'Agendada');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = { patientId, doctorId, date, time, status };

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Falha no submit, modal não será fechado.', error);
    }
  };

  // Definição dos campos para o AuthForm
  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: 'select',
        name: 'patientId',
        label: 'Paciente',
        value: patientId,
        onChange: (val) => setPatientId(val as string),
        options: [
          { value: '', label: 'Selecione o paciente' },
          ...patientOptions,
        ],
        required: true,
      },
      {
        elementType: 'select',
        name: 'doctorId',
        label: 'Médico',
        value: doctorId,
        onChange: (val) => setDoctorId(val as string),
        options: [
          { value: '', label: 'Selecione o médico' },
          ...doctorOptions,
        ],
        required: true,
      },
      {
        elementType: 'input',
        type: 'date',
        name: 'date',
        label: 'Data da Consulta',
        value: date,
        placeholder: '',
        onChange: (val) => setDate(val as string),
        required: true,
      },
      {
        elementType: 'input',
        type: 'time',
        name: 'time',
        label: 'Hora da Consulta',
        value: time,
        placeholder: '',
        onChange: (val) => setTime(val as string),
        required: true,
      },
      {
        elementType: 'select',
        name: 'status',
        label: 'Status',
        value: status,
        onChange: (val) => setStatus(val as StatusType),
        options: [
          { value: 'Agendada', label: 'Agendada' },
          { value: 'Concluída', label: 'Concluída' },
          { value: 'Cancelada', label: 'Cancelada' },
        ],
      },
    ],
    [patientId, doctorId, date, time, status, patientOptions, doctorOptions]
  );

  return (
    <div className={styles.appointmentForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? 'Atualizar Consulta' : 'Agendar Consulta'}
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