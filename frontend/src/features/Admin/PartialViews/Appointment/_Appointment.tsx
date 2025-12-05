import React, { useState } from "react";
import { Modal } from "../../../../components/Modal/Modal";
import { AppointmentAdmin } from "../../components/appointment/AppointmentAdmin";
import { AppointmentForm } from "../../components/appointment/components/AppointmentForm/AppointmentForm";
import { useAppointments } from "../../components/appointment/hooks/useAppointments";
// CORREÇÃO 1: Importando os tipos corretos (Operation = Envio, AdminResponse = Leitura)
import type {
  AppointmentOperation,
  AppointmentAdminResponse,
} from "../../components/appointment/types/appointment.type";
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

  // CORREÇÃO 2: Removido usePatients (não é mais necessário para o form novo)
  
  const [activeTab, setActiveTab] = useState<"consultas" | "solicitacoes">("consultas");

  // --- Estado do Modal ---
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  
  // O Form espera receber o objeto de resposta completo para preencher os campos
  const [editingAppointmentData, setEditingAppointmentData] = useState<AppointmentAdminResponse | null>(null);

  // --- Manipuladores ---
  
  const handleOpenCreateAppointmentModal = () => {
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenEditAppointmentModal = (appointmentId: string) => {
    // CORREÇÃO 3: Buscamos o objeto completo na lista para passar ao Form
    const appointmentToEdit = appointments.find(a => a.id === appointmentId) || null;
    
    setEditingAppointmentId(appointmentId);
    setEditingAppointmentData(appointmentToEdit);
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setEditingAppointmentId(null);
    setEditingAppointmentData(null);
  };

  // O Form envia um AppointmentOperation
  const handleAppointmentFormSubmit = async (data: AppointmentOperation) => {
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
            // Passamos apenas o ID aqui, pois buscamos os dados completos no handler acima
            onEditAppointment={async (id) => handleOpenEditAppointmentModal(id)}
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
              // CORREÇÃO 4: Removido patientOptions (não existe mais no componente)
              typeOptions={typeOptions}
              onTypeChange={(tipoId) => fetchSlotsForType(tipoId)}
              slotOptions={slotOptions}
            />
          </Modal>
        </>
      )}

      {/* Conteúdo da Aba Solicitações */}
      {activeTab === "solicitacoes" && <ConsultaRequestTable />}
      
    </div>
  );
};