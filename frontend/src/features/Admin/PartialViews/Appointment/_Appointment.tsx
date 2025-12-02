import React, { useState, useMemo } from "react";
import { Modal } from "../../../../components/Modal/Modal";
import { AppointmentAdmin } from "../../components/appointment/AppointmentAdmin";
import { AppointmentForm } from "../../components/appointment/components/AppointmentForm/AppointmentForm";
import { useAppointments } from "../../components/appointment/hooks/useAppointments";
import type {
  AppointmentFormData,
  FormSelectOption,
} from "../../components/appointment/types/appointment.type";
import { usePatients } from "../../components/Patient/hooks/usePatients";
import { ConsultaRequestTable } from "../../components/appointment/components/ConsultaRequest/Table/AppointmentRequestTable";
import styles from "./_Appointment.module.scss";

export const AppointmentPartial: React.FC = () => {
  // --- Lógica de Consultas ---
  const {
    appointments,
    isLoading: isLoadingAppointments,
    error: errorAppointments,
    addAppointment,
    removeAppointment,
    editAppointment,
    typeOptions,       // Lista de especialidades carregada no mount
    slotOptions,       // Lista de slots (vazia no início)
    fetchSlotsForType, // Função que busca slots no backend
  } = useAppointments();

  // CORREÇÃO: Valor padrão para evitar erro no map
  const { patients = [] } = usePatients();

  const [activeTab, setActiveTab] = useState<"consultas" | "solicitacoes">("consultas");

  // --- Estado do Modal ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | number | null>(null);
  const [editingAppointmentData, setEditingAppointmentData] = useState<AppointmentFormData | null>(null);

  // --- Opções ---
  const patientOptions: FormSelectOption[] = useMemo(() => {
    if (!patients) return [];
    return patients.map((pat) => ({
      value: pat.id,
      label: pat.name,
    }));
  }, [patients]);

  // --- Manipuladores ---
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenEditAppointmentModal = (
    appointmentId: string,
    data: AppointmentFormData
  ) => {
    setEditingAppointmentId(appointmentId);
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

  return (
    // AQUI ESTÁ A CORREÇÃO DE LAYOUT:
    // Trocamos o Fragment <> pela div com classe de container
    <div className={styles.appointmentContainer}>
      
      {/* Container das Abas */}
      <div className={styles.tabContainer}>
        <div className={styles.tabButtonsWrapper}>
          <button
            className={`${styles.tabButton} ${activeTab === 'consultas' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('consultas')}
          >
            Consultas
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'solicitacoes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('solicitacoes')}
          >
            Solicitações
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Consultas */}
      {activeTab === "consultas" && (
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
            appointments={appointments || []}
            isLoading={isLoadingAppointments}
            error={errorAppointments}
            hasMore={false}
            loadMoreAppointments={() => {}}
            onEditAppointment={async (id, data) => handleOpenEditAppointmentModal(String(id), data)}
            onDeleteAppointment={async (id) => removeAppointment(id)}
          />

          <Modal
            isOpen={isAppointmentModalOpen}
            onClose={handleCloseAppointmentModal}
            title={editingAppointmentId ? "Atualizar Consulta" : "Agendar Nova Consulta"}
          >
            <AppointmentForm
              onSubmit={handleAppointmentFormSubmit}
              onCancel={handleCloseAppointmentModal}
              initialData={editingAppointmentData}
              isLoading={isLoadingAppointments}
              patientOptions={patientOptions}
              typeOptions={typeOptions}
              onTypeChange={(tipoId) => fetchSlotsForType(tipoId)}
              slotOptions={slotOptions}
            />
          </Modal>
        </>
      )}

      {/* Conteúdo da Aba Solicitações */}
      {activeTab === "solicitacoes" && <ConsultaRequestTable />}
      
    </div> // Fecha a div container
  );
};