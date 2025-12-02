import React from "react";
import styles from './DoctorAdmin.module.scss';
import type {DoctorAdminProps } from "./types/doctor.type";
import { ActionMenu } from "../../../../components/ActionMenu/ActionMenu";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";
import Swal from "sweetalert2";

export const DoctorAdmin: React.FC<DoctorAdminProps> = ({
  doctors = [], // Garante array vazio se vier undefined
  isLoading,
  error,
  hasMore,
  onEditDoctor,
  onDeleteDoctor,
  loadMoreDoctors,
}) => {
  
  const handleDeleteClick = (id: string) => { 
    
    // Debug para você ver no console o que está chegando
    console.log("ID recebido no Handler:", id); 

    if (!id) {
        console.error("ERRO: ID inválido.");
        Swal.fire('Erro', 'ID do médico não encontrado.', 'error');
        return;
    }

    // Chama a prop que vai pro hook
    onDeleteDoctor(id);
  };

  const { lastElementRef } = useInfiniteScroll(
    loadMoreDoctors,
    hasMore,
    isLoading
  );

  const renderContent = () => {
    // 1. Carregamento inicial (sem dados)
    if (isLoading && doctors.length === 0) {
      return <p className={styles.loading}>Carregando médicos...</p>;
    }

    // 2. Erro
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }

    // 3. Lista Vazia
    if (doctors.length === 0) {
      return <p className={styles.empty}>Nenhum médico encontrado.</p>;
    }

    // 4. Lista de Cards
    return (
      <div className={styles.doctorList}>
        {doctors.map((doctor, index) => {
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
                  onDelete={() => handleDeleteClick(doctor.id)}
                />
              </div>

              <div className={styles.cardBody}>
                <p>
                  <strong>CRM:</strong> <span>{doctor.crm}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span>{doctor.email}</span>
                </p>
                <p>
                  <strong>Id:</strong> <span>{doctor.id}</span>
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
      
      {/* Loading de paginação (quando já tem itens na tela) */}
      {isLoading && doctors.length > 0 && (
        <p className={styles.loading} style={{ border: 'none', background: 'transparent' }}>
          Carregando mais...
        </p>
      )}
      
      {/* Fim da lista */}
      {!isLoading && !hasMore && doctors.length > 0 && (
        <p className={styles.empty} style={{ border: 'none', background: 'transparent', padding: '1rem' }}>
          Fim dos resultados.
        </p>
      )}
    </section>
  );
};