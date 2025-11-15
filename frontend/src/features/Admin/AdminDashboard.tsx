import React, { useState } from 'react';

import styles from './AdminDashboard.module.scss'; 

// Importa as novas "Partial Views"
import { _DoctorPartial } from './PartialViews/_Doctor';
import { _PatientPartial } from './PartialViews/_Patient';
import { _AppointmentPartial } from './PartialViews/_Appointment';

// Definindo os tipos de abas
type AdminTab = 'doctors' | 'patients' | 'appointments'; 

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('doctors'); 

  // --- Toda a lógica de hooks, modais e handlers foi movida ---

  // --- Renderização ---
  const renderActiveTabContent = () => { 
    switch (activeTab) {
      case 'doctors':
        return <_DoctorPartial />; // Renderiza a parcial
      case 'patients':
        return <_PatientPartial />; // Renderiza a parcial
      case 'appointments':
        return <_AppointmentPartial />; // Renderiza a parcial
      default: 
        return null;
    }
  };

  return (
    <div className={styles.adminPage}> 
      <header className={styles.adminHeader}>
        {/* O título principal fica na index */}
        <h1 className={styles.title}>Painel do Admin</h1>
        {/* O botão "Adicionar" foi movido para as parciais */}
      </header>

      {/* Navegação por Abas (Tabs) */}
      <nav className={styles.tabNav}> 
        <button
          className={`${styles.tabButton} ${
            activeTab === 'doctors' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('doctors')}
        >
          Médicos
        </button>

        <button
          className={`${styles.tabButton} ${
            activeTab === 'patients' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('patients')}
        >
          Pacientes
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'appointments' ? styles.active : ''
          }`}
          onClick={() => setActiveTab('appointments')}
        >
          Consultas
        </button>
      </nav>

      {/* Conteúdo da Aba Ativa */}
      <main>{renderActiveTabContent()}</main>

      {/* --- Todos os Modais foram movidos para suas parciais --- */}
    </div>
  );
};

export default AdminDashboard;