import styles from './PatientAdmin.module.scss';
import { showDeleteConfirm } from '../utils/adminUtils';
import type { Patient, PatientAdminProps } from './types/patient.types';
import { ActionMenu } from '../../../components/ActionMenu/ActionMenu';
import { useInfiniteScroll } from '../../../shared/utils/forPages.utils';

export const PatientAdmin: React.FC<PatientAdminProps> = ({
  patients,
  isLoading,
  error,
  hasMore,
  onEditPatient,
  onDeletePatient,
  loadMorePatients,
}) => {
  const handleDeleteClick = async (patient: Patient) => {
    const confirmed = await showDeleteConfirm(patient.name);
    if (confirmed) {
      onDeletePatient(patient);
    }
  };

  // Hook para o scroll infinito
  const { lastElementRef } = useInfiniteScroll(
    loadMorePatients,
    hasMore,
    isLoading
  );

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
        {patients.map((patient, index) => {
          const isLastElement = patients.length === index + 1;
          return (
            <div
              key={patient.id}
              className={styles.patientCard}
              ref={isLastElement ? lastElementRef : null}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <h3>{patient.name}</h3>
                  <p>CPF: {patient.cpf || 'Não informado'}</p>
                </div>
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
          );
        })}
      </div>
    );
  };

  return (
    <section className={styles.adminContent}>
      {renderContent()}
      {/* Indicador de carregamento para as páginas seguintes */}
      {isLoading && patients.length > 0 && <p className={styles.loading}>Carregando mais...</p>}
      {/* Mensagem de fim de lista */}
      {!isLoading && !hasMore && patients.length > 0 && (
        <p className={styles.empty}>Fim dos resultados.</p>
      )}
    </section>
  );
};