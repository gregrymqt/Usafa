import React from 'react';
import ProfileCard from '../../components/card/card'; // [cite: 23]
import { MapPinIcon } from '../../components/icons'; // [cite: 23]
import { BuscaUsafa } from '../../components/buscaUsafa/BuscaUsafa'; // [cite: 24]
import styles from './_Usafa.module.scss';

interface UsafaProps {
  cep: string;
}

export const _UsafaPartial: React.FC<UsafaProps> = ({ cep }) => {
  return (
    <div className={styles.usafaContainer}>
      <ProfileCard title="Sua USAFA de Referência" icon={<MapPinIcon />}>
        <BuscaUsafa cep={cep} /> 
      </ProfileCard>
    </div>
  );
};