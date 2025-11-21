// (Caminho: .../components/AppointmentAdmin/AppointmentAdmin.tsx)

import React from 'react';
import styles from './AppointmentAdmin.module.scss';
import { ActionMenu } from '../../../components/ActionMenu/ActionMenu';
import type { AppointmentAdminProps, AppointmentFormData } from './types/appointment.type';
import { useInfiniteScroll } from '../../../shared/utils/forPages.utils';

// --- Componente da Aba de Consultas ---

export const AppointmentAdmin: React.FC<AppointmentAdminProps> = ({
  appointments,
  isLoading,
  error,
  hasMore,
  onEditAppointment,
  onDeleteAppointment,
  loadMoreAppointments,
}) => {
  // Função para formatar a data (sem alterações)
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Data inválida'; 
      return date.toLocaleString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return isoString;
    }
  };

  const { lastElementRef } = useInfiniteScroll(
    loadMoreAppointments,
    hasMore,
    isLoading
  );

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
        {appointments.map((appt, index) => {
          const isLastElement = appointments.length === index + 1;
          return (
            <div
              key={appt.id}
              className={styles.appointmentCard}
              ref={isLastElement ? lastElementRef : null}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <h3>{appt.patient.name}</h3>
                  <p>com {appt.doctor.name}</p>
                </div>

                <ActionMenu
                  onUpdate={() => {
                    // Constrói o objeto esperado pelo formulário de edição
                    const formData: AppointmentFormData = {
                      patientId: appt.patient.id.toString(),
                      horarioSlotId: appt.horarioSlotId,
                      tipoConsultaId: appt.tipoConsultaId,
                      status: appt.status,
                    };
                    onEditAppointment(appt.id, formData);
                  }}
                  onDelete={() => onDeleteAppointment(String(appt.id))}
                />
              </div>
              <div className={styles.cardBody}>
                <p>
                  <strong>Data:</strong> {formatDateTime(appt.date)}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status${appt.status}`]
                  }`}
                >
                  {appt.status}
                </span>
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
      {isLoading && appointments.length > 0 && <p className={styles.loading}>Carregando mais...</p>}
      {!isLoading && !hasMore && appointments.length > 0 && <p className={styles.empty}>Fim dos resultados.</p>}
    </section>
  );
};