import React from 'react';

import { HomeContent } from '../../types/home.type';
import styles from './Service.module.scss'; // Seus estilos
import Carousel from '../../../../components/Carousel/Carousel';
import { Card } from '../../../../components/Card/Card';

interface ServicesSectionProps {
  items: HomeContent[];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ items }) => {
  // Configurações do Swiper mantidas
  const cardCarouselOptions = {
    pagination: { clickable: true },
    navigation: true,
    loop: items.length > 3, // Só faz loop se tiver bastantes itens
    autoplay: { delay: 4000, disableOnInteraction: false },
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
      1400: { slidesPerView: 4, spaceBetween: 30 }
    },
  };

  if (items.length === 0) return null; // Não renderiza a seção se não tiver serviços

  return (
    <section className={styles.servicesContainer}>
      <h2>Nossos Serviços</h2>
      <div className={styles.carouselWrapper}>
        <Carousel
          items={items}
          renderItem={(card) => (
            <div style={{ width: '100%' }}> 
              <Card
                title={card.title}
                description={card.description}
                imageUrl={card.imageUrl}
              >
                <a href="#" className={styles.cardActionLink}>Saiba mais</a>
              </Card>
            </div>
          )}
          swiperOptions={cardCarouselOptions}
        />
      </div>
    </section>
  );
};

export default ServicesSection;