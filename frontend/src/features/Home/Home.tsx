import React from 'react';

import styles from './Home.module.css';

// Importe o CSS do Swiper se necessário no seu projeto
import 'swiper/css';
import 'swiper/css/pagination';
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
    // Idealmente use um componente de Skeleton ou Spinner aqui
    return <div className={styles.loader}>Carregando...</div>;
  }

  return (
    <div className={styles.homeContainer}>
      
      {/* 1. CARROSSEL PRINCIPAL */}
      {carouselItems.length > 0 && (
        <section className={styles.mainCarouselSection}>
          <Carousel
            items={carouselItems}
            renderItem={(item) => (
              <div className={styles.carouselItemWrapper}>
                 <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.mainCarouselImage}
                  />
                  {/* Se quiser colocar texto sobre a imagem no banner */}
                  <div className={styles.bannerCaption}>
                      <h2>{item.title}</h2>
                  </div>
              </div>
            )}
            swiperOptions={{
              pagination: { clickable: true },
              autoplay: { delay: 5000 },
              slidesPerView: 1,
            }}
          />
        </section>
      )}

      {/* 2. SERVIÇOS */}
      <ServicesSection items={serviceItems} />

      {/* 3. SOBRE NÓS */}
      {/* Verifica se aboutItem existe antes de renderizar a seção inteira se preferir */}
      {aboutItem && <AboutSection data={aboutItem} />}

      {/* 4. GALERIA */}
      {galleryItems.length > 0 && (
        <section className={styles.gallerySection}>
          <h2>Galeria</h2>
          <div className={styles.galleryGrid}>
            {galleryItems.map(item => (
              <div key={item.id} className={styles.galleryItem}>
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;