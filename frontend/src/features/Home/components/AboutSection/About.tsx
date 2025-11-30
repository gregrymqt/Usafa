import React from 'react';
import { HomeContent } from '../../types/home.type';
import styles from './About.module.scss';

interface AboutSectionProps {
  data?: HomeContent; // Pode ser undefined se o admin não cadastrou ainda
}

const AboutSection: React.FC<AboutSectionProps> = ({ data }) => {
  // Se não vier dados do banco, mostra um padrão ou não mostra nada
  if (!data) return null; 

  return (
    <section className={styles.aboutSection}>
      <div className={styles.content}>
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        {/* Se tiver imagem cadastrada no About, renderiza */}
        {data.imageUrl && <img src={data.imageUrl} alt="Sobre nós" />}
      </div>
    </section>
  );
};

export default AboutSection;