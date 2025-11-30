import React, { useState, useMemo, useEffect } from 'react';
import styles from './AppointmentForm.module.scss';
import AuthForm from '../../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../../components/Form/types/form.type';
import type { AppointmentFormData, AppointmentStatus, FormSelectOption } from '../../types/appointment.type';

// Ajuste os tipos conforme seu projeto se necessário
interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: AppointmentFormData | null;
  isLoading: boolean;
  
  // REMOVI patientOptions (não precisamos mais carregar lista de pacientes)
  patientOptions: FormSelectOption[];
  typeOptions: FormSelectOption[]; // Lista de especialidades
  slotOptions: FormSelectOption[]; // Lista de horários filtrados
  onTypeChange: (tipoId: string) => void; // Função para buscar os slots (vinda do hook)
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  typeOptions, 
  slotOptions,
  onTypeChange // Recebendo a função de atualizar horários
}) => {
  
  const [patientId, setPatientId] = useState(initialData?.patientId || '');
  const [tipoConsultaId, setTipoConsultaId] = useState(initialData?.tipoConsultaId || '');
  const [horarioSlotId, setHorarioSlotId] = useState<number | undefined>(initialData?.horarioSlotId);
  const [status, setStatus] = useState<AppointmentStatus>(initialData?.status || 'Agendada');
  const [sintomas, setSintomas] = useState(initialData?.sintomas || '');

  // Efeito para carregar os slots caso seja uma edição
  useEffect(() => {
    if (initialData?.tipoConsultaId) {
      onTypeChange(initialData.tipoConsultaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (horarioSlotId && patientId && tipoConsultaId) {
      
      // Encontra dados extras do slot para enviar data/hora corretas
      const selectedSlot = slotOptions.find(slot => slot.value === horarioSlotId);
      
      await onSubmit({
        patientId, // Aqui vai a string que você digitou/colou
        tipoConsultaId,
        horarioSlotId,
        status,
        sintomas,
        date: selectedSlot?.label || '', // Ajuste conforme seu DTO espera
        time: '', 
      });
    }
  };

  const fields: FormField[] = useMemo(
    () => [
      // --- ALTERAÇÃO AQUI: De Select para Input ---
      {
        elementType: 'input', // Mudado para input de texto
        type: 'text',
        name: 'patientId',
        label: 'ID do Paciente',
        placeholder: 'Cole o ID ou CPF do paciente aqui...',
        value: patientId,
        onChange: (val) => setPatientId(val as string),
        required: true,
      },
      // ---------------------------------------------
      {
        elementType: 'select',
        name: 'tipoConsultaId',
        label: 'Especialidade',
        value: tipoConsultaId,
        // Lógica de Cascata do Componente 1 aplicada aqui
        onChange: (val) => {
            const novoTipo = val as string;
            setTipoConsultaId(novoTipo);
            setHorarioSlotId(undefined); // Limpa horário anterior
            onTypeChange(novoTipo); // Busca novos horários
        },
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
        disabled: !tipoConsultaId || slotOptions.length === 0, // Desabilita se não tiver tipo
        placeholder: !tipoConsultaId 
            ? 'Selecione a especialidade primeiro' 
            : (slotOptions.length === 0 ? 'Nenhum horário livre' : 'Selecione um horário')
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
    [patientId, tipoConsultaId, horarioSlotId, status, sintomas, typeOptions, slotOptions, onTypeChange] 
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