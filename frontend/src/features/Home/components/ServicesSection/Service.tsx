import React from 'react';
import styles from './Service.module.scss';
import { Card } from '../../../../components/Card/Card';
import Carousel from '../../../../components/Carousel/Carousel';
import { HomeContent } from '../../types/home.type';
// Importe o helper
import { getImageUrl } from '../../../../shared/utils/image.utils';

interface ServicesSectionProps {
  items: HomeContent[];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const cardCarouselOptions = {
    pagination: { clickable: true },
    navigation: true,
    loop: items.length >= 3, 
    autoplay: { delay: 4000, disableOnInteraction: false },
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
      1400: { slidesPerView: 4, spaceBetween: 30 }
    },
  };

  return (
    <section className={styles.servicesContainer}>
      <h2>Nossos Serviços</h2>
      <div className={styles.carouselWrapper}>
        <Carousel
          items={items}
          renderItem={(card) => {
            // 1. Processa a URL dentro do renderItem
            const finalImageUrl = getImageUrl(card.imageUrl);
            
            return (
              <div className={styles.cardSlide}>
                <Card
                  title={card.title}
                  description={card.description}
                  // Passa a URL processada (ou undefined se nula)
                  imageUrl={finalImageUrl || undefined} 
                >
                  <button className={styles.cardButton}>Saiba Mais</button>
                </Card>
              </div>
            );
          }}
          swiperOptions={cardCarouselOptions}
        />
      </div>
    </section>
  );
};

export default ServicesSection;

export interface CardData {
  title: string;
  description: string;
  imageUrl: string;
}