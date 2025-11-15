import React from 'react';
import ProfileCard from '../components/card'; // [cite: 23]
import { MapPinIcon } from '../components/icons'; // [cite: 23]
import { BuscaUsafa } from '../components/BuscaUsafa'; // [cite: 24]

interface UsafaProps {
  cep: string;
}

export const _UsafaPartial: React.FC<UsafaProps> = ({ cep }) => {
  return (
    <ProfileCard title="Sua USAFA de Referência" icon={<MapPinIcon />}>
      <BuscaUsafa cep={cep} /> 
    </ProfileCard>
  );
};