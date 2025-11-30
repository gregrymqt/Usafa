// ... imports anteriores
import styles from './Profile.module.scss';
import { useUserProfileData } from './hooks/userHook'; 
import { _MeusDadosPartial } from './PartialViews/_MeusDados';
import { _VisualizarDadosPartial } from './PartialViews/visualizarDados/_VisualizarDados';
import { _UsafaPartial } from './PartialViews/_Usafa';
import { UserIcon, MapPinIcon } from './components/icons'; 
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { MinhasConsultasPartial } from './components/consultas/_MinhasConsultasPartial';

// Ícone de Calendário Simples (Se não tiver no seu pacote de icones)
const CalendarIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ProfileLogo = () => (
  <span className={styles.profileLogo}>Meu Perfil</span>
);

export default function Profile() {
  const { 
    userData, 
    isUpdating,
    updateError,
    handleUpdateProfile
  } = useUserProfileData();

  if (!userData) {
    return <div className={styles.unauthenticatedContainer}>Você precisa estar logado.</div>;
  }
  
  const profileViews: ISidebarView[] = [
    {
      name: 'Visualizar Dados',
      icon: <UserIcon />,
      component: <_VisualizarDadosPartial userData={userData} />,
    },
    {
      name: 'Minhas Consultas', // [Nova View] - Coloquei em segundo lugar por relevância
      icon: <CalendarIcon />,
      component: <MinhasConsultasPartial userId={userData.publicId} />, // Passando o ID necessário
    },
    {
      name: 'Editar Dados',
      icon: <UserIcon />,
      component: (
        <_MeusDadosPartial
          userData={userData}
          isUpdating={isUpdating}
          updateError={updateError}
          handleUpdateProfile={handleUpdateProfile}
        />
      ),
    },
    {
      name: 'Minha USAFA',
      icon: <MapPinIcon />,
      component: (
        <_UsafaPartial cep={userData.cep} />
      ),
    },
  ];

  return (
    <SidebarLayout 
      views={profileViews}
      brandLogo={<ProfileLogo />}
    />
  );
}