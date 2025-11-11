import React from 'react';
import { Card } from '../../../components/Card';

interface ProfileCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente de "Card" reutilizável para agrupar seções da página de perfil,
 * utilizando o componente genérico Card.
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({ title, icon, children }) => (
  <Card>
    <>
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
        <div className="text-blue-600">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </>
  </Card>
);

export default ProfileCard;