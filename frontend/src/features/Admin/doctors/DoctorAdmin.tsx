import { showDeleteConfirm } from "../utils/adminUtils";
import type { Doctor, DoctorAdminProps } from "./types/doctor.type";
import styles from './DoctorAdmin.module.scss';
import { ActionMenu } from "../../../components/ActionMenu/ActionMenu";


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
              {/* 3. PROP RENOMEADA (onEdit -> onUpdate) */}
              <ActionMenu
                onUpdate={() => onEditDoctor(doctor)}
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
    <section className={styles.adminContent}>
      {renderContent()}
    </section>
  );
};