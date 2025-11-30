import React, { useState, useMemo } from "react";
import { Modal } from "../../../components/Modal/Modal";
import styles from "../AdminDashboard.module.scss";
import { AppointmentAdmin } from "../components/appointment/AppointmentAdmin";
import { AppointmentForm } from "../components/appointment/components/AppointmentForm/AppointmentForm";
import { useAppointments } from "../components/appointment/hooks/useAppointments";
import type {
  AppointmentFormData,
  FormSelectOption,
} from "../components/appointment/types/appointment.type";
import { usePatients } from "../components/Patient/hooks/usePatients";

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

  // CORREÇÃO 1: Desestruturar com valor padrão caso o hook retorne undefined
  // ou garantir o tratamento no useMemo abaixo.
  const { patients = [] } = usePatients();

  // --- Estado do Modal ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | number | null
  >(null);
  const [editingAppointmentData, setEditingAppointmentData] =
    useState<AppointmentFormData | null>(null);

  // --- Opções ---
  const patientOptions: FormSelectOption[] = useMemo(() => {
    // CORREÇÃO 2: Verificação de segurança extra.
    // Se patients for undefined ou null, retorna array vazio e não quebra o .map
    if (!patients) return [];

    return patients.map((pat) => ({
      value: pat.id,
      label: pat.name,
    }));
  }, [patients]);

  const typeOptions: FormSelectOption[] = [];
  const slotOptions: {
    value: number;
    label: string;
    date: string;
    time: string;
  }[] = [];

  // --- Manipuladores de Modal ---
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenEditAppointmentModal = (
    appointmentId: string,
    data: AppointmentFormData // O AppointmentAdmin já mandou isso pronto!
  ) => {
    setEditingAppointmentId(appointmentId);
    
    // Simplesmente salvamos o data que veio pronto
    setEditingAppointmentData(data); 
    
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
      console.error("Falha ao salvar consulta.", error);
    }
  };

  const handleDeleteAppointment = (id: string) => {
    removeAppointment(id);
  };

  return (
    <>
      <header className={styles.adminHeader}>
        <button
          onClick={handleOpenCreateAppointmentModal}
          className={styles.addButton}
        >
          Agendar Consulta
        </button>
      </header>

      <AppointmentAdmin
        appointments={appointments || []} // CORREÇÃO 3: Passando array vazio se for undefined
        isLoading={isLoadingAppointments}
        error={errorAppointments}
        hasMore={false}
        loadMoreAppointments={() => {}}
        onEditAppointment={async (id, data) =>
          handleOpenEditAppointmentModal(String(id), data)
        }
        onDeleteAppointment={async (id) => handleDeleteAppointment(id)}
      />

      <Modal
        isOpen={isAppointmentModalOpen}
        onClose={handleCloseAppointmentModal}
        title={
          editingAppointmentId ? "Atualizar Consulta" : "Agendar Nova Consulta"
        }
      >
        <AppointmentForm
          onSubmit={handleAppointmentFormSubmit}
          onCancel={handleCloseAppointmentModal}
          initialData={editingAppointmentData}
          isLoading={isLoadingAppointments}
          patientOptions={patientOptions}
          typeOptions={typeOptions}
          slotOptions={slotOptions}
          onTypeChange={() => {}} // Dummy function for now
        />
      </Modal>
    </>
  );
};
