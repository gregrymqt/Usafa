// src/features/AdminDashboard/AdminDashboard.tsx
import React from 'react';
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { DoctorIcon, PatientIcon, AppointmentIcon } from './utils/AdminIcons';

// Ícones
import { FaUserCircle, FaClipboardList, FaHome, FaCalendarAlt } from 'react-icons/fa'; 

// Views (Partials)
// Certifique-se que os caminhos estão corretos
import { AppointmentPartial } from './PartialViews/Appointment/_Appointment';
import { ProfilePartial } from './components/profile/_Profile';
import HomeAdmin from './components/HomeAdmin/HomeAdmin';
import TipoConsultaManager from './components/appointmentType/AppointmentTypeAdmin';
import { DoctorPartial } from './PartialViews/Doctor/_Doctor';
import { PatientPartial } from './PartialViews/Patient/_Patient';
import { SlotManagementIndex } from './components/TimeSlots/SlotManagementIndex';

// REMOVIDO: Imports de Appointment e AppointmentFormData antigos.
// REMOVIDO: Interface AppointmentAdminProps (ela pertence ao componente AppointmentAdmin, não ao Dashboard).

const AdminLogo = () => (
  <span style={{ fontWeight: 700 }}>Painel Admin</span>
);

const AdminDashboard: React.FC = () => {
  
  // Função wrapper para aplicar estilos globais da área admin
  const wrapContent = (component: React.ReactNode) => (
    <div className="adminPage"> 
      {component}
    </div>
  );

  // Configuração das Views do Sidebar
  const adminViews: ISidebarView[] = [
    {
      name: 'Meu Perfil',
      icon: <FaUserCircle />, 
      component: wrapContent(<ProfilePartial />), 
    },
    {
      name: 'Gestão da Home',
      icon: <FaHome />,
      component: wrapContent(<HomeAdmin />), 
    },
    {
      name: 'Tipos de Consulta',
      icon: <FaClipboardList />,
      component: wrapContent(<TipoConsultaManager />), 
    },
    {
      name: 'Médicos',
      icon: <DoctorIcon />,
      component: wrapContent(<DoctorPartial />), 
    },
    {
      name: 'Pacientes',
      icon: <PatientIcon />,
      component: wrapContent(<PatientPartial />), 
    },
    {
      name: 'Consultas',
      icon: <AppointmentIcon />,
      component: wrapContent(<AppointmentPartial />),
    },
    {
      name: 'Gerenciar Agenda', 
      icon: <FaCalendarAlt />, 
      component: wrapContent(<SlotManagementIndex />), 
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