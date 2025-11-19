import React, { useState, useMemo } from 'react';
import styles from './AppointmentForm.module.scss';
import AuthForm from '../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../components/Form/types/form.type';
import type { AppointmentStatus } from '../../types/appointment.type';
import type { AppointmentFormProps } from './types/Appointment.types';

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  patientOptions,
  typeOptions, // Nova prop
  slotOptions, // Nova prop (contém os horários reais do banco)
}) => {
  
  // Estados alinhados com o novo DTO
  const [patientId, setPatientId] = useState(initialData?.patientId || '');
  const [tipoConsultaId, setTipoConsultaId] = useState(initialData?.tipoConsultaId || '');
  const [horarioSlotId, setHorarioSlotId] = useState<number | undefined>(initialData?.horarioSlotId);
  const [status, setStatus] = useState<AppointmentStatus>(initialData?.status || 'Agendada');
  const [sintomas, setSintomas] = useState(initialData?.sintomas || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (horarioSlotId && patientId && tipoConsultaId) {
      const formData = { 
        patientId, 
        tipoConsultaId, 
        horarioSlotId, 
        status, 
        sintomas 
      };
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Falha no submit admin:', error);
      }
    }
  };

  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: 'select',
        name: 'patientId',
        label: 'Paciente',
        value: patientId,
        onChange: (val) => setPatientId(val as string),
        options: [{ value: '', label: 'Selecione o paciente' }, ...patientOptions],
        required: true,
      },
      {
        elementType: 'select',
        name: 'tipoConsultaId',
        label: 'Especialidade',
        value: tipoConsultaId,
        onChange: (val) => setTipoConsultaId(val as string),
        options: [{ value: '', label: 'Selecione a especialidade' }, ...typeOptions],
        required: true,
      },
      {
        elementType: 'select',
        name: 'horarioSlotId', // O Admin escolhe um slot real do banco
        label: 'Horário / Médico',
        value: horarioSlotId || '',
        onChange: (val) => setHorarioSlotId(Number(val)),
        options: slotOptions, // Ex: [{value: 1, label: "25/10 14:00 - Dr. House"}]
        required: true,
        placeholder: 'Selecione um horário disponível'
      },
      {
        elementType: 'select',
        name: 'status',
        label: 'Status',
        value: status,
        onChange: (val) => setStatus(val as AppointmentStatus),
        options: [
          { value: 'Agendada', label: 'Agendada' },
          { value: 'Concluída', label: 'Concluída' },
          { value: 'Cancelada', label: 'Cancelada' },
          { value: 'Pendente', label: 'Pendente' },
        ],
        required: true,
      },
      {
        elementType: 'textarea',
        name: 'sintomas',
        label: 'Observações / Sintomas',
        value: sintomas,
        onChange: (val) => setSintomas(val as string),
        placeholder: 'Detalhes adicionais...',
      },
    ],
    [patientId, tipoConsultaId, horarioSlotId, status, sintomas, patientOptions, typeOptions, slotOptions]
  );

  return (
    <div className={styles.appointmentForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? 'Atualizar Agendamento' : 'Criar Agendamento'}
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