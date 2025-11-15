import styles from './PatientAdmin.module.scss';
import { showDeleteConfirm } from '../utils/adminUtils';
import type { Patient, PatientAdminProps } from './types/patient.types';
import { ActionMenu } from '../../../components/ActionMenu/ActionMenu';
// 1. ADICIONADO O IMPORT GENÉRICO

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
              {/* 3. PROP RENOMEADA (onEdit -> onUpdate) */}
              <ActionMenu
                onUpdate={() => onEditPatient(patient)}
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