import React, { useState, useMemo } from 'react';
import styles from './AppointmentForm.module.scss';
import AuthForm from '../../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../../components/Form/types/form.type';
import type { AppointmentStatus } from '../../types/appointment.type';
import type { AppointmentFormProps } from './types/AppointmentForm.types';

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  patientOptions,
  typeOptions, 
  slotOptions, 
}) => {
  
  const [patientId, setPatientId] = useState(initialData?.patientId || '');
  const [tipoConsultaId, setTipoConsultaId] = useState(initialData?.tipoConsultaId || '');
  const [horarioSlotId, setHorarioSlotId] = useState<number | undefined>(initialData?.horarioSlotId);
  const [status, setStatus] = useState<AppointmentStatus>(initialData?.status || 'Agendada');
  const [sintomas, setSintomas] = useState(initialData?.sintomas || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (horarioSlotId && patientId && tipoConsultaId) {
      // Encontra o slot selecionado para obter a data e a hora
      const selectedSlot = slotOptions.find(slot => slot.value === horarioSlotId);

      if (!selectedSlot) {
        console.error('Slot selecionado não encontrado!');
        // Idealmente, mostrar um erro para o usuário aqui
        return;
      }

      try {
        // Agora o objeto enviado para onSubmit está correto
        await onSubmit({
          patientId,
          tipoConsultaId,
          horarioSlotId,
          status,
          sintomas,
          date: selectedSlot.date, // Adicionado
          time: selectedSlot.time, // Adicionado
        });
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
        name: 'horarioSlotId', 
        label: 'Horário / Médico',
        value: horarioSlotId || '',
        onChange: (val) => setHorarioSlotId(Number(val)),
        options: slotOptions, 
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
    // CORREÇÃO: Removido 'onCancel' desta lista abaixo
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