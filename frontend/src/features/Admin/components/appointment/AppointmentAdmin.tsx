import React from 'react';
import styles from './AppointmentAdmin.module.scss';
import { ActionMenu } from '../../../../components/ActionMenu/ActionMenu';
import { useInfiniteScroll } from '../../../../shared/utils/forPages.utils';
// Imports Novos
import type { 
  AppointmentAdminResponse, 
  AppointmentOperation 
} from './types/appointment.type';

export interface AppointmentAdminProps {
  // Alterado para o tipo correto de Resposta Admin
  appointments: AppointmentAdminResponse[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onEditAppointment: (id: string, data: AppointmentOperation) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  loadMoreAppointments: () => void;
}

export const AppointmentAdmin: React.FC<AppointmentAdminProps> = ({
  appointments = [],
  isLoading,
  error,
  hasMore,
  onEditAppointment,
  onDeleteAppointment,
  loadMoreAppointments,
}) => {
  
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
                  {/* Usando propriedades planas do DTO */}
                  <h3>{appt.pacienteNome || 'Paciente Desconhecido'}</h3>
                  <p>com {appt.medicoNome || 'Médico não atribuído'}</p>
                </div>

                <ActionMenu
                  onUpdate={() => {
                    // CONVERSÃO IMPORTANTE:
                    // De AppointmentAdminResponse (Visual) para AppointmentOperation (Envio)
                    const formData: AppointmentOperation = {
                      patientId: appt.pacienteId,
                      horarioSlotId: appt.horarioSlotId,
                      tipoConsultaId: appt.tipoConsultaId,
                      status: appt.status,
                      sintomas: appt.sintomas
                    };
                    onEditAppointment(appt.id, formData);
                  }}
                  onDelete={() => onDeleteAppointment(appt.id)}
                />
              </div>
              <div className={styles.cardBody}>
                <p>
                  {/* Data e Horário já vêm formatados do backend */}
                  <strong>Data:</strong> {appt.data} às {appt.horario}
                </p>
                <p>
                   <strong>Especialidade:</strong> {appt.especialidadeNome}
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