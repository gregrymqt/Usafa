import { useState, useEffect } from "react";
import { showDeleteConfirm } from "../utils/adminUtils";
import type { Doctor } from "./types/doctor.type";
import styles from './DoctorAdmin.module.scss';



// --- Ícone de Ações (SVG) ---
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

// --- Componente do Menu Dropdown ---
interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o menu se clicar fora
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
          e.stopPropagation(); // Impede o clique de fechar o menu imediatamente
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
          <button onClick={onDelete} className={`${styles.dropdownItem} ${styles.deleteItem}`}>
            Deletar
          </button>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal (AGORA CONTEÚDO DA ABA) ---
// Removemos o hook daqui, ele vai para o componente pai
// Também removemos o controle do Modal
interface DoctorAdminProps {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
}

export const DoctorAdmin: React.FC<DoctorAdminProps> = ({
  doctors,
  isLoading,
  error,
  onEditDoctor,
  onDeleteDoctor,
}) => {
  // Confirmação de deleção
  const handleDeleteClick = async (doctor: Doctor) => {
    const confirmed = await showDeleteConfirm(doctor.name);
    if (confirmed) {
      // A função de remover (que chama o hook) vem do pai
      onDeleteDoctor(doctor);
    }
  };

  // --- Renderização ---

  const renderContent = () => {
    if (isLoading && doctors.length === 0) {
      return <p className={styles.loading}>Carregando médicos...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (doctors.length === 0) {
      return <p className={styles.empty}>Nenhum médico cadastrado.</p>;
    }

    // Renderização da Lista (Mobile-first Cards)
    return (
      <div className={styles.doctorList}>
        {doctors.map((doctor) => (
          <div key={doctor.id} className={styles.doctorCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <h3>{doctor.name}</h3>
                <p>{doctor.specialty}</p>
              </div>
              <ActionMenu
                onEdit={() => onEditDoctor(doctor)}
                onDelete={() => handleDeleteClick(doctor)}
              />
            </div>
            <div className={styles.cardBody}>
              <p>
                <strong>CRM:</strong> {doctor.crm}
              </p>
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    // Removemos o .adminPage, .adminHeader, etc.
    // Agora é só a seção de conteúdo.
    <section className={styles.adminContent}>
      {renderContent()}
    </section>
    // O Modal também foi removido daqui e movido para o componente pai
  );
};