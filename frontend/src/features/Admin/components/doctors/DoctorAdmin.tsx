import { showDeleteConfirm } from "../../utils/adminUtils";
import type { Doctor, DoctorAdminProps } from "./types/doctor.type";
import styles from './DoctorAdmin.module.scss';
import { ActionMenu } from "../../../../components/ActionMenu/ActionMenu";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";

export const DoctorAdmin: React.FC<DoctorAdminProps> = ({
  doctors = [], // <--- CORREÇÃO AQUI: Se doctors for undefined, vira []
  isLoading,
  error,
  hasMore,
  onEditDoctor,
  onDeleteDoctor,
  loadMoreDoctors,
}) => {
  // Confirmação de deleção
  const handleDeleteClick = async (doctor: Doctor) => {
    const confirmed = await showDeleteConfirm(doctor.name);
    if (confirmed) {
      onDeleteDoctor(doctor);
    }
  };

  // Hook para o scroll infinito
  const { lastElementRef } = useInfiniteScroll(
    loadMoreDoctors,
    hasMore,
    isLoading
  );

  // --- Renderização ---
  const renderContent = () => {
    // Agora doctors nunca será undefined, então .length sempre funciona
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
        {doctors.map((doctor, index) => {
          // Verifica se este é o último elemento para aplicar a ref
          const isLastElement = doctors.length === index + 1;
          return (
            <div
              key={doctor.id}
              className={styles.doctorCard}
              ref={isLastElement ? lastElementRef : null}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialty}</p>
                </div>
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
          );
        })}
      </div>
    );
  };

  return (
    <section className={styles.adminContent}>
      {renderContent()}
      {/* Indicador de carregamento para as páginas seguintes */}
      {isLoading && doctors.length > 0 && <p className={styles.loading}>Carregando mais...</p>}
      {/* Mensagem de fim de lista */}
      {!isLoading && !hasMore && doctors.length > 0 && (
        <p className={styles.empty}>Fim dos resultados.</p>
      )}
    </section>
  );
};