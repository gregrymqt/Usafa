import React from 'react';
import ProfileCard from './components/card';
import { UserIcon, MapPinIcon } from './components/icons';
// 1. CORREÇÃO: O caminho da importação estava errado.
// Agora importa o componente corrigido do diretório local.
import { BuscaUsafa } from './components/BuscaUsafa'; 
import { ProfileUpdateForm } from './components/ProfileUpdateForm';

import { useUserProfileData } from './hooks/userHook';

export default function Profile() {
  
  const { 
    userData, 
    isLoading, 
    error,
    isUpdating,
    updateError,
    handleUpdateProfile
  } = useUserProfileData('123'); // (Assumindo que o hook 'userHook' existe)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Carregando perfil...</div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Erro:</strong> {error || 'Não foi possível carregar os dados do perfil.'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna 1: Formulário (Correto) */}
        <div className="md:col-span-1">
          <ProfileCard title="Meus Dados" icon={<UserIcon />}>
            <ProfileUpdateForm
              user={userData}
              onUpdate={handleUpdateProfile}
              isUpdating={isUpdating}
              updateError={updateError}
            />
          </ProfileCard>
        </div>

        {/* Coluna 2: O Mapa (Correto) */}
        <div className="md:col-span-2">
          <ProfileCard title="Sua USAFA de Referência" icon={<MapPinIcon />}>
            {/* Isto agora funciona perfeitamente:
              1. 'userData.cep' vem do hook 'useUserProfileData'.
              2. É passado para 'BuscaUsafa'.
              3. 'BuscaUsafa' usa 'useUsafaCalculator' para *apenas exibir* o mapa.
              4. Quando o 'ProfileUpdateForm' salva um novo CEP, 'userData.cep' muda,
                 e este componente atualiza o mapa automaticamente.
            */}
            <BuscaUsafa cep={userData.cep} />
          </ProfileCard>
        </div>

      </div>
    </div>
  );
}