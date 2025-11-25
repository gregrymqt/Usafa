// src/features/AdminDashboard/AdminDashboard.tsx
import React from 'react';
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { DoctorIcon, PatientIcon, AppointmentIcon } from './utils/AdminIcons';

// Importe a nova PartialView e um ícone (ex: FaUserCircle)
import { FaUserCircle } from 'react-icons/fa'; // Exemplo de ícone
import { AppointmentPartial } from './PartialViews/_Appointment';
import { DoctorPartial } from './PartialViews/_Doctor';
import { PatientPartial } from './PartialViews/_Patient';
import { ProfilePartial } from './components/profile/_Profile';

const AdminLogo = () => (
  <span style={{ fontWeight: 700 }}>Painel Admin</span>
);

const AdminDashboard: React.FC = () => {
  // Adicione a aba 'Meu Perfil' à lista
  const adminViews: ISidebarView[] = [
    {
      name: 'Meu Perfil',
      icon: <FaUserCircle />, 
      component: <ProfilePartial />, // Nova view conectada
    },
    {
      name: 'Médicos',
      icon: <DoctorIcon />,
      component: <DoctorPartial />,
    },
    {
      name: 'Pacientes',
      icon: <PatientIcon />,
      component: <PatientPartial />,
    },
    {
      name: 'Consultas',
      icon: <AppointmentIcon />,
      component: <AppointmentPartial />,
    },
  ];

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <SidebarLayout 
        views={adminViews}
        brandLogo={<AdminLogo />} 
      />
    </div>
  );
};

export default AdminDashboard;