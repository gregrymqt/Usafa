import React from 'react';
import styles from './styles.module.scss';
import type { CardProps } from './types/card.type';


export const Card: React.FC<CardProps> = ({ title, description, imageUrl, children }) => {
  return (
    <div className={styles.card}>
      {imageUrl && <img src={imageUrl} alt={title || 'Imagem do card'} className={styles.cardImage} />}
      <div className={styles.cardContent}>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {description && <p className={styles.cardDescription}>{description}</p>}
        {children}
      </div>
    </div>
  );
}