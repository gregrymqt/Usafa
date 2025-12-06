import React from "react";
import styles from "./DoctorAdmin.module.scss";
import type { DoctorAdminProps } from "./types/doctor.type";
import { ActionMenu } from "../../../../components/ActionMenu/ActionMenu";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";
import Swal from "sweetalert2";
// Importe o helper
import { getImageUrl } from "../../../../shared/utils/image.utils";

export const DoctorAdmin: React.FC<DoctorAdminProps> = ({
  doctors = [],
  isLoading,
  error,
  hasMore,
  onEditDoctor,
  onDeleteDoctor,
  loadMoreDoctors,
}) => {
  const handleDeleteClick = (id: string) => {
    if (!id) {
      Swal.fire("Erro", "ID do médico não encontrado.", "error");
      return;
    }
    onDeleteDoctor(id);
  };

  const { lastElementRef } = useInfiniteScroll(
    loadMoreDoctors,
    hasMore,
    isLoading
  );

  const renderContent = () => {
    if (isLoading && doctors.length === 0) {
      return <p className={styles.loading}>Carregando médicos...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (doctors.length === 0) {
      return <p className={styles.empty}>Nenhum médico encontrado.</p>;
    }

    return (
      <div className={styles.doctorList}>
        {doctors.map((doctor, index) => {
          const isLastElement = doctors.length === index + 1;

          // 1. Resolve a URL da foto do médico
          const doctorImageUrl = getImageUrl(doctor.picture);

          return (
            <div
              key={doctor.id}
              className={styles.doctorCard}
              ref={isLastElement ? lastElementRef : null}
            >
              <div className={styles.cardHeader}>
                {/* 2. Área da Foto do Médico */}
                <div className={styles.doctorInfoWrapper}>
                  <div className={styles.avatarContainer}>
                    {doctorImageUrl ? (
                      <img
                        src={doctorImageUrl}
                        alt={doctor.name}
                        className={styles.doctorAvatar}
                        crossOrigin="anonymous"
                        // MUDE ISSO: Pare de esconder a imagem no erro, vamos depurar
                        onError={(e) => {
                          console.error(
                            "Erro ao carregar imagem:",
                            doctorImageUrl
                          );
                          e.currentTarget.src =
                            "https://via.placeholder.com/50?text=Error"; // Opcional: imagem de fallback visual
                        }}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {doctor.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardInfo}>
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                  </div>
                </div>

                <ActionMenu
                  onUpdate={() => onEditDoctor(doctor)}
                  onDelete={() => handleDeleteClick(doctor.id)}
                />
              </div>

              <div className={styles.cardBody}>
                <p>
                  <strong>Id:</strong> <span>{doctor.id}</span>
                </p>
                <p>
                  <strong>CRM:</strong> <span>{doctor.crm}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span>{doctor.email}</span>
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

      {isLoading && doctors.length > 0 && (
        <p className={styles.loading}>Carregando mais...</p>
      )}

      {!isLoading && !hasMore && doctors.length > 0 && (
        <p className={styles.empty}>Fim dos resultados.</p>
      )}
    </section>
  );
};
