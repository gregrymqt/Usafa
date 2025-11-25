import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/Modal/Modal';
import styles from '../AdminDashboard.module.scss';
import { AppointmentAdmin } from '../components/appointment/AppointmentAdmin';
import { AppointmentForm } from '../components/appointment/components/AppointmentForm/AppointmentForm';
import { useAppointments } from '../components/appointment/hooks/useAppointments';
// Certifique-se de que AppointmentFormData está atualizado no seu arquivo de types para ter 'horarioSlotId' e 'tipoConsultaId'
import type { AppointmentFormData, FormSelectOption } from '../components/appointment/types/appointment.type';
import { usePatients } from '../components/Patient/hooks/usePatients'; // Assuming usePatients is correctly imported

// Função auxiliar
const splitDateTime = (dateString: string) => {
  if (!dateString) return { date: '', time: '' };
  const parts = dateString.split(/[T ]/);
  return { 
    date: parts[0] || '', 
    time: parts[1]?.substring(0, 5) || '' 
  };
};

export const AppointmentPartial: React.FC = () => {
  
  // --- Lógica de Consultas ---
  const {
    appointments,
    isLoading: isLoadingAppointments,
    error: errorAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
  } = useAppointments();

  const { patients } = usePatients();

  // --- Estado do Modal ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | number | null>(null);
  const [editingAppointmentData, setEditingAppointmentData] = useState<AppointmentFormData | null>(null);

  // --- Opções ---
  const patientOptions: FormSelectOption[] = useMemo(() => {
    return patients.map((pat) => ({
      value: pat.id,
      label: pat.name,
    }));
  }, [patients]);

  // TODO: Você precisa criar hooks para buscar esses dados do backend (Ex: useSpecialties, useSlots)
  // Estou deixando vazio para COMPILAR, mas o select ficará vazio na tela. 
  // CORREÇÃO: typeOptions e slotOptions devem ser do tipo correto esperado pelo AppointmentForm
  const typeOptions: FormSelectOption[] = [];
  // CORREÇÃO: slotOptions deve ser do tipo SlotOption[]
  const slotOptions: { value: number; label: string; date: string; time: string }[] = [];

  // --- Manipuladores de Modal ---
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
    setIsAppointmentModalOpen(true);
  };

  // CORREÇÃO: Recebe ID (string) pois é o que o AppointmentAdmin envia
  const handleOpenEditAppointmentModal = (appointmentId: string) => {
    // Busca o objeto completo na lista baseado no ID
    const appointment = appointments.find(a => String(a.id) === appointmentId);

    if (!appointment) return;

    setEditingAppointmentId(appointmentId);
    
    const { date, time } = splitDateTime(appointment.date);

    // CORREÇÃO: Mapeando para os campos que o AppointmentForm NOVO espera
    setEditingAppointmentData({
      patientId: String(appointment.patient.id),
      // doctorId: NÃO EXISTE MAIS NO FORMULÁRIO
      // Você precisa decidir como preencher estes campos novos baseado no agendamento antigo:
      tipoConsultaId: '', // Teria que vir de appointment.tipoConsulta.id se existir
      horarioSlotId: appointment.horarioSlotId, // Teria que vir de appointment.slot.id se existir
      
      // Campos auxiliares mantidos se necessário, mas o form usa Slot agora
      date: date,
      time: time,
      status: appointment.status,
      sintomas: appointment.sintomas || ''
    });
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
  };

  const handleAppointmentFormSubmit = async (data: AppointmentFormData) => { 
    try {
      if (editingAppointmentId) {
        await editAppointment(String(editingAppointmentId), data);
      } else {
        await addAppointment(data);
      }
      handleCloseAppointmentModal();
    } catch (error) {
      console.error('Falha ao salvar consulta.', error);
    }
  };

  const handleDeleteAppointment = (id: string) => { 
      removeAppointment(id);
  };

  return (
    <>
      <header className={styles.adminHeader}>
        <button onClick={handleOpenCreateAppointmentModal} className={styles.addButton}>
          Agendar Consulta
        </button>
      </header>

      <AppointmentAdmin
        appointments={appointments}
        isLoading={isLoadingAppointments}
        error={errorAppointments}
        // CORREÇÃO: Passando props de paginação obrigatórias (mesmo que dummy por enquanto)
        hasMore={false}
        loadMoreAppointments={() => {}}
        // Passando as funções corrigidas
        onEditAppointment={async (id) => handleOpenEditAppointmentModal(id)}
        onDeleteAppointment={async (id) => handleDeleteAppointment(id)} 
      />

      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal} 
        title={editingAppointmentId ? 'Atualizar Consulta' : 'Agendar Nova Consulta'}
      >
        <AppointmentForm
          onSubmit={handleAppointmentFormSubmit}
          onCancel={handleCloseAppointmentModal}
          initialData={editingAppointmentData}
          isLoading={isLoadingAppointments}
          // CORREÇÃO: O form exige typeOptions e slotOptions, não doctorOptions
          patientOptions={patientOptions}
          typeOptions={typeOptions}
          slotOptions={slotOptions}
        />
      </Modal>
    </>
  );
};