import React, { useState, useEffect } from 'react';
import type { Patient } from '../types/patient.types';
import { showDeleteConfirm } from '../../../utils/adminUtils';
import styles from './PatientAdmin.module.scss';

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

// --- Componente da Aba de Pacientes ---

interface PatientAdminProps {
  patients: Patient[]; // Virá do hook (pai)
  isLoading: boolean;
  error: string | null;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
}

export const PatientAdmin: React.FC<PatientAdminProps> = ({
  patients,
  isLoading,
  error,
  onEditPatient,
  onDeletePatient,
}) => {
  const handleDeleteClick = async (patient: Patient) => {
    const confirmed = await showDeleteConfirm(patient.name);
    if (confirmed) {
      onDeletePatient(patient);
    }
  };

  const renderContent = () => {
    if (isLoading && patients.length === 0) {
      return <p className={styles.loading}>Carregando pacientes...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (patients.length === 0) {
      return <p className={styles.empty}>Nenhum paciente cadastrado.</p>;
    }

    return (
      <div className={styles.patientList}>
        {patients.map((patient) => (
          <div key={patient.id} className={styles.patientCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <h3>{patient.name}</h3>
                <p>CPF: {patient.cpf || 'Não informado'}</p>
              </div>
              <ActionMenu
                onEdit={() => onEditPatient(patient)}
                onDelete={() => handleDeleteClick(patient)}
              />
            </div>
            <div className={styles.cardBody}>
              <p>
                <strong>Email:</strong> {patient.email}
              </p>
              <p>
                <strong>Telefone:</strong> {patient.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return <section className={styles.adminContent}>{renderContent()}</section>;
};