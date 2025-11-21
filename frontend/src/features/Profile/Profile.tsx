
// 2. Importar o hook e as novas parciais
import { useUserProfileData } from './hooks/userHook'; // [cite: 26]
import { _MeusDadosPartial } from './PartialViews/_MeusDados';
import { _UsafaPartial } from './PartialViews/_Usafa';
import { UserIcon, MapPinIcon } from './components/icons'; // [cite: 23]
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';

// Logo para esta sidebar específica
const ProfileLogo = () => (
  <span style={{ fontWeight: 700 }}>Meu Perfil</span>
);

export default function Profile() {
  // 3. O hook é chamado aqui, no componente "pai"
  const { 
    userData, 
    isLoading, 
    error,
    isUpdating,
    updateError,
    handleUpdateProfile
  } = useUserProfileData(); // [cite: 26-27]

  // 4. Tratamento de loading e erro (continua igual)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Carregando perfil...</div>
      </div>
    ); // [cite: 27-28]
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Erro:</strong> {error || 'Não foi possível carregar os dados do perfil.'}
        </div>
      </div>
    ); // [cite: 28-29]
  }
  
  // 5. Definir as "views" desta sidebar
  const profileViews: ISidebarView[] = [
    {
      name: 'Meus Dados',
      icon: <UserIcon />,
      component: (
        // 6. Passar os dados do hook para a parcial via props
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
        <_UsafaPartial cep={userData.cep} /> // [cite: 33]
      ),
    },
  ];

  // 7. Renderizar o Layout Genérico
  return (
    <SidebarLayout 
      views={profileViews}
      brandLogo={<ProfileLogo />}
    />
  );
}