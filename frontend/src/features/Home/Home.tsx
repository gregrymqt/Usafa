import React from 'react';

import styles from './Home.module.scss';
import Carousel from '../../components/Carousel/Carousel';
import AboutSection from './components/AboutSection/About';
import ServicesSection from './components/ServicesSection/Service';
import { useHomeLogic } from './hooks/useHomeLogic';

const Home: React.FC = () => {
  const { 
    loading, 
    carouselItems, 
    serviceItems, 
    aboutItem, 
    galleryItems 
  } = useHomeLogic();

  if (loading) {
    return <div className={styles.loader}>Carregando conteúdo...</div>;
  }

  return (
    <div className={styles.homeContainer}>
      
      {/* 1. Carrossel Principal (Só renderiza se tiver itens) */}
      {carouselItems.length > 0 && (
        <section className={styles.mainCarouselSection}>
          <Carousel
            items={carouselItems}
            renderItem={(item) => (
              <img
                src={item.imageUrl} // Agora vem do banco
                alt={item.title}
                className={styles.mainCarouselImage}
              />
            )}
            swiperOptions={{
              pagination: { clickable: true },
              autoplay: { delay: 5000 },
              slidesPerView: 1,
            }}
          />
        </section>
      )}

      {/* 2. Seção de Serviços Dinâmica */}
      <ServicesSection items={serviceItems} />

      {/* 3. Sobre Nós Dinâmico */}
      <AboutSection data={aboutItem} />

      {/* 4. Galeria (Se quiser manter como lista simples vinda do CMS) */}
      {galleryItems.length > 0 && (
        <section className={styles.gallerySection}>
          <h2>Galeria</h2>
          <div className={styles.galleryGrid}>
            {galleryItems.map(item => (
              <div key={item.id} className={styles.galleryItem}>
                <img src={item.imageUrl} alt={item.title} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;