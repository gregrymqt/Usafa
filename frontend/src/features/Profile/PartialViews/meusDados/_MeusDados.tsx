import React from 'react';
import ProfileCard from '../../components/card/card'; // [cite: 23]
import { UserIcon } from '../../components/icons'; // [cite: 23]
import styles from './_MeusDados.module.scss';
import { ProfileUpdateForm } from '../../components/updateForm/ProfileUpdateForm'; // [cite: 25]
import type { MeusDadosProps } from '../../types/profile.type';

export const _MeusDadosPartial: React.FC<MeusDadosProps> = ({
  userData,
  isUpdating,
  updateError,
  handleUpdateProfile
}) => {
  return (
    <div className={styles.meusDadosContainer}>
      <ProfileCard title="Editar Dados" icon={<UserIcon />}>
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