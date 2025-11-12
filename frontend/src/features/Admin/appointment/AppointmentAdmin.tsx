import React, { useState, useEffect } from 'react';
import styles from './AppointmentAdmin.module.scss';
import { showDeleteConfirm } from '../utils/adminUtils';
import type { Appointment } from './types/appointment.type';

// --- Ícones (copiados do DoctorAdmin para consistência) ---
const ActionsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={styles.actionIcon}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
    />
  </svg>
);

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.actionMenu}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={styles.actionButton}
      >
        <ActionsIcon />
      </button>
      {isOpen && (
        <div className={styles.actionDropdown}>
          <button onClick={onEdit} className={styles.dropdownItem}>
            Atualizar
          </button>
          <button
            onClick={onDelete}
            className={`${styles.dropdownItem} ${styles.deleteItem}`}
          >
            Deletar
          </button>
        </div>
      )}
    </div>
  );
};

// --- Componente da Aba de Consultas ---

interface AppointmentAdminProps {
  appointments: Appointment[]; // Virá do hook (pai)
  isLoading: boolean;
  error: string | null;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointment: Appointment) => void;
}

export const AppointmentAdmin: React.FC<AppointmentAdminProps> = ({
  appointments,
  isLoading,
  error,
  onEditAppointment,
  onDeleteAppointment,
}) => {
  // Função para formatar a data (será melhorada com o hook de lógica)
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "Data inválida";
      // Formato: 25/10/2023 às 14:30
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return isoString; // Fallback
    }
  };

  const handleDeleteClick = async (appointment: Appointment) => {
    const confirmed = await showDeleteConfirm(
      `Consulta de ${appointment.patient.name} com ${appointment.doctor.name}`
    );
    if (confirmed) {
      onDeleteAppointment(appointment);
    }
  };

  const renderContent = () => {
    if (isLoading && appointments.length === 0) {
      return <p className={styles.loading}>Carregando consultas...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (appointments.length === 0) {
      return <p className={styles.empty}>Nenhuma consulta agendada.</p>;
    }

    return (
      <div className={styles.appointmentList}>
        {appointments.map((appt) => (
          <div key={appt.id} className={styles.appointmentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                {/* Paciente e Médico */}
                <h3>{appt.patient.name}</h3>
                <p>com {appt.doctor.name}</p>
              </div>
              <ActionMenu
                onEdit={() => onEditAppointment(appt)}
                onDelete={() => handleDeleteClick(appt)}
              />
            </div>
            <div className={styles.cardBody}>
              <p>
                <strong>Data:</strong> {formatDateTime(appt.date)}
              </p>
            </div>
            <div className={styles.cardFooter}>
              {/* Adiciona uma classe de estilo baseada no Status */}
              <span
                className={`${styles.statusBadge} ${
                  styles[`status${appt.status}`]
                }`}
              >
                {appt.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return <section className={styles.adminContent}>{renderContent()}</section>;
};