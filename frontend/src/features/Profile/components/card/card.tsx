import React from 'react';
import { Card } from '../../../../components/Card/Card';
import styles from './card.module.scss';

interface ProfileCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente de "Card" reutilizável para agrupar seções da página de perfil,
 * utilizando o componente genérico Card.
 */
 const ProfileCard: React.FC<ProfileCardProps> = ({ title, icon, children }) => (
  <Card title={title} description="">
    <>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.cardContent}>{children}</div>
    </>
  </Card>
);

export default ProfileCard;