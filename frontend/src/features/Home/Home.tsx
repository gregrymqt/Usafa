import React from 'react';
import styles from './Home.module.scss';

import 'swiper/css';
import 'swiper/css/pagination';
import Carousel from '../../components/Carousel/Carousel';
import AboutSection from './components/AboutSection/About';
import ServicesSection from './components/ServicesSection/Service';
import { useHomeLogic } from './hooks/useHomeLogic';
// Importe o helper
import { getImageUrl } from '../../shared/utils/image.utils';

const Home: React.FC = () => {
  const { 
    loading, 
    carouselItems, 
    serviceItems, 
    aboutItem, 
    galleryItems 
  } = useHomeLogic();

  if (loading) {
    return <div className={styles.loader}>Carregando...</div>;
  }

  return (
    <div className={styles.homeContainer}>
      
      {/* 1. CARROSSEL PRINCIPAL */}
      {carouselItems.length > 0 && (
        <section className={styles.mainCarouselSection}>
          <Carousel
            items={carouselItems}
            renderItem={(item) => {
              // Processa imagem do Banner
              const bannerUrl = getImageUrl(item.imageUrl);
              
              return (
                <div className={styles.carouselItemWrapper}>
                   {bannerUrl && (
                     <img
                        src={bannerUrl}
                        alt={item.title}
                        className={styles.mainCarouselImage}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                   )}
                  <div className={styles.bannerCaption}>
                      <h2>{item.title}</h2>
                  </div>
                </div>
              );
            }}
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
      {aboutItem && <AboutSection data={aboutItem} />}

      {/* 4. GALERIA */}
      {galleryItems.length > 0 && (
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>Galeria</h2>
          <div className={styles.galleryGrid}>
            {galleryItems.map(item => {
              // Processa imagem da Galeria
              const galleryUrl = getImageUrl(item.imageUrl);
              
              if (!galleryUrl) return null; // Não renderiza item sem imagem

              return (
                <div key={item.id} className={styles.galleryItem}>
                  <img 
                    src={galleryUrl} 
                    alt={item.title} 
                    loading="lazy" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;