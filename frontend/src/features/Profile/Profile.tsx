// ... imports anteriores
import styles from './Profile.module.scss';
import { useUserProfileData } from './hooks/userHook'; 
import { _MeusDadosPartial } from './PartialViews/meusDados/_MeusDados';
import { _VisualizarDadosPartial } from './PartialViews/visualizarDados/_VisualizarDados';
import { _UsafaPartial } from './PartialViews/usafa/_Usafa';
import { UserIcon, MapPinIcon, CalendarIcon } from './components/icons'; 
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';
import { MinhasConsultasPartial } from './components/consultas/_MinhasConsultasPartial';

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