// src/features/AdminDashboard/AdminDashboard.tsx
import React from 'react';
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { DoctorIcon, PatientIcon, AppointmentIcon } from './utils/AdminIcons';

// Ícones
import { FaUserCircle, FaClipboardList } from 'react-icons/fa'; 

// Views Existentes
import { AppointmentPartial } from './PartialViews/_Appointment';
import { DoctorPartial } from './PartialViews/_Doctor';
import { PatientPartial } from './PartialViews/_Patient';
import { ProfilePartial } from './components/profile/_Profile';
import TipoConsultaManager from './components/appointmentType/AppointmentTypeAdmin';

// Nova View (Ajuste o caminho '../Admin/TipoConsulta' se a pasta estiver em outro local)

const AdminLogo = () => (
  <span style={{ fontWeight: 700 }}>Painel Admin</span>
);

const AdminDashboard: React.FC = () => {
  // Lista de abas da Sidebar
  const adminViews: ISidebarView[] = [
    {
      name: 'Meu Perfil',
      icon: <FaUserCircle />, 
      component: <ProfilePartial />,
    },
    {
      name: 'Tipos de Consulta', // Nova aba adicionada
      icon: <FaClipboardList />,
      component: <TipoConsultaManager />,
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