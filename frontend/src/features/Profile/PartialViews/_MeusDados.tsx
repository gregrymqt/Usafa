import React from 'react';
import ProfileCard from '../components/card'; // [cite: 23]
import { UserIcon } from '../components/icons'; // [cite: 23]
import { ProfileUpdateForm } from '../components/ProfileUpdateForm'; // [cite: 25]
import type { MeusDadosProps } from '../types/profile.type';

export const _MeusDadosPartial: React.FC<MeusDadosProps> = ({
  userData,
  isUpdating,
  updateError,
  handleUpdateProfile
}) => {
  return (
    // Adiciona um wrapper para centralizar o formulário
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <ProfileCard title="Meus Dados" icon={<UserIcon />}>
        <ProfileUpdateForm
          user={userData}
          onUpdate={handleUpdateProfile}
          isUpdating={isUpdating}
          updateError={updateError}
        />
      </ProfileCard>
    </div>
  );
};