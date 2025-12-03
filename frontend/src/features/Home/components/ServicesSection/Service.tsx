import React from 'react';
import styles from './Service.module.scss';
import { Card } from '../../../../components/Card/Card';
import Carousel from '../../../../components/Carousel/Carousel';
import { HomeContent } from '../../types/home.type';

interface ServicesSectionProps {
  items: HomeContent[];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const cardCarouselOptions = {
    pagination: { clickable: true },
    navigation: true,
    // Loop só deve ser true se houver slides suficientes para preencher a view
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
          renderItem={(card) => (
            <div className={styles.cardSlide}> {/* Padding para sombra do card não cortar */}
              <Card
                title={card.title}
                description={card.description}
                imageUrl={card.imageUrl}
              >
                {/* Botão ou Link de ação */}
                <button className={styles.cardButton}>Saiba Mais</button>
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