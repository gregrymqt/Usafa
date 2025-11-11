import React from 'react';
import styles from './styles.module.scss';
import type { CardProps } from './types/card.type';


export const Card: React.FC<CardProps> = ({ imageUrl, children }) => {
  return (
    <div className={styles.card}>
      {imageUrl && <img src={imageUrl} alt="" className={styles.cardImage} />}
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
}