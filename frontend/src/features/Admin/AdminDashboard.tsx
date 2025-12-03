// src/features/AdminDashboard/AdminDashboard.tsx
import React from 'react';
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { DoctorIcon, PatientIcon, AppointmentIcon } from './utils/AdminIcons';

// Ícones
import { FaUserCircle, FaClipboardList, FaHome, FaCalendarAlt } from 'react-icons/fa'; 

// Views Existentes
import { AppointmentPartial } from './PartialViews/Appointment/_Appointment';

import { ProfilePartial } from './components/profile/_Profile';
import HomeAdmin from './components/HomeAdmin/HomeAdmin';
import TipoConsultaManager from './components/appointmentType/AppointmentTypeAdmin';
import { DoctorPartial } from './PartialViews/Doctor/_Doctor';
import { PatientPartial } from './PartialViews/Patient/_Patient';
import { SlotManagementIndex } from './components/TimeSlots/SlotManagementIndex';
import { Appointment, AppointmentFormData } from './components/appointment/types/appointment.type';

// Nova View (Ajuste o caminho '../Admin/TipoConsulta' se a pasta estiver em outro local)
export interface AppointmentAdminProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onEditAppointment: (id: string, data: AppointmentFormData) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
  loadMoreAppointments: () => void;
}

const AdminLogo = () => (
  <span style={{ fontWeight: 700 }}>Painel Admin</span>
);
const AdminDashboard: React.FC = () => {
  
  // 1. Crie essa função simples para aplicar o seu SCSS
  const wrapContent = (component: React.ReactNode) => (
    <div className="adminPage"> {/* <--- AQUI ESTÁ A MÁGICA QUE FALTAVA */}
      {component}
    </div>
  );

  // 2. Use a função para envolver seus componentes
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
    // --- NOVO ITEM ADICIONADO AQUI ---
    {
      name: 'Gerenciar Agenda', // Nome que aparecerá no menu
      icon: <FaCalendarAlt />,  // Ícone de calendário
      // IMPORTANTE: Substitua 'ID_DO_MEDICO' pelo ID real ou lógica de seleção
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