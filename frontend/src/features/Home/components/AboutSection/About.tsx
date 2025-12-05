import React from 'react';
import styles from './About.module.scss';
import { HomeContent } from '../../types/home.type';
// Ajuste o caminho conforme sua estrutura
import { getImageUrl } from '../../../../shared/utils/image.utils'; 

interface AboutSectionProps {
  data: HomeContent; 
}

const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  // 1. Processa a URL
  const finalImageUrl = getImageUrl(data.imageUrl);

  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>        
        <div className={styles.textContent}>
            <h2>{data.title}</h2>
            <p className={styles.description}>{data.description}</p>
        </div>
        
        {/* Só renderiza se tiver uma URL válida gerada */}
        {finalImageUrl && (
            <div className={styles.imageWrapper}>
                <img 
                  src={finalImageUrl} 
                  alt={data.title}
                  onError={(e) => {
                    // Esconde a imagem se der erro (404)
                    e.currentTarget.style.display = 'none';
                  }} 
                />
            </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;