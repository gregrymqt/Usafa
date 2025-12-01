import React from 'react';
import styles from './About.module.scss';
import { HomeContent } from '../../types/home.type';

interface AboutSectionProps {
  data: HomeContent; // Removemos '?' pois já verificamos no pai (Home)
}

const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.textContent}>
            <h2>{data.title}</h2>
            {/* Dica: Se a descrição vier com quebras de linha do banco, use white-space: pre-line no CSS */}
            <p className={styles.description}>{data.description}</p>
        </div>
        
        {data.imageUrl && (
            <div className={styles.imageWrapper}>
                <img src={data.imageUrl} alt={data.title} />
            </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;