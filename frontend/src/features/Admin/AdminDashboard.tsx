import React from 'react';
// 1. REMOVEMOS o useState e o styles daqui, pois o Layout vai cuidar disso.
// import styles from './AdminDashboard.module.scss';

// 2. IMPORTAR O LAYOUT GENÉRICO E SEUS TIPOS
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';

// 3. IMPORTAR AS "PARTIAL VIEWS" (as páginas filhas do admin)
import { _DoctorPartial } from './PartialViews/_Doctor';
import { _PatientPartial } from './PartialViews/_Patient';
import { _AppointmentPartial } from './PartialViews/_Appointment';

// 4. IMPORTAR ÍCONES (substitua pelos seus)
import { DoctorIcon, PatientIcon, AppointmentIcon } from './utils/AdminIcons.tsx';

// O "brandLogo" para esta sidebar específica
const AdminLogo = () => (
  <span style={{ fontWeight: 700 }}>Painel Admin</span>
);

const AdminDashboard: React.FC = () => {
  // 5. DEFINIR AS "ABAS" *ESPECÍFICAS* DO ADMIN
  //    (Isto substitui seu <nav>  e useState [cite: 4])
  const adminViews: ISidebarView[] = [
    {
      name: 'Médicos',
      icon: <DoctorIcon />,
      component: <_DoctorPartial />, // [cite: 2]
    },
    {
      name: 'Pacientes',
      icon: <PatientIcon />,
      component: <_PatientPartial />, // [cite: 2]
    },
    {
      name: 'Consultas',
      icon: <AppointmentIcon />,
      component: <_AppointmentPartial />, // [cite: 3]
    },
  ];

  // 6. RENDERIZAR O LAYOUT GENÉRICO, PASSANDO AS ABAS DO ADMIN
  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {/* O AdminDashboard agora é SÓ o layout */}
      <SidebarLayout 
        views={adminViews}
        brandLogo={<AdminLogo />} 
      />
    </div>
  );
};

export default AdminDashboard;