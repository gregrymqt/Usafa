// (Caminho: .../components/AppointmentAdmin/AppointmentAdmin.tsx)

import React from 'react';
import styles from './AppointmentAdmin.module.scss';
import { ActionMenu } from '../../../components/ActionMenu/ActionMenu';
import type { AppointmentAdminProps } from './types/appointment.type';

// 2. O ÍCONE E O ACTIONMENU LOCAL FORAM REMOVIDOS DAQUI [c.f. 2-8]

// --- Componente da Aba de Consultas ---

export const AppointmentAdmin: React.FC<AppointmentAdminProps> = ({
  appointments,
  isLoading,
  error,
  onEditAppointment,
  onDeleteAppointment,
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

  // 3. A FUNÇÃO 'handleDeleteClick' FOI REMOVIDA [c.f. 12-13]
  //    (A lógica de confirmação 'Swal.fire' já está no ActionMenu global)

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
        {appointments.map((appt) => (
          <div key={appt.id} className={styles.appointmentCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <h3>{appt.patient.name}</h3>
                <p>com {appt.doctor.name}</p> 
              </div>
              
              {/* 4. O ActionMenu global é usado aqui */}
              <ActionMenu
                onUpdate={() => onEditAppointment(appt)}
                // Passamos a função de deletar. O ActionMenu
                // vai pedir a confirmação (Swal) ANTES de executá-la.
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
        ))}
      </div>
    );
  };

  return <section className={styles.adminContent}>{renderContent()}</section>; 
};