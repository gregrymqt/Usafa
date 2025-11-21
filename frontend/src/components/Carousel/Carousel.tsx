import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

// Note: Swiper v12 may handle CSS differently. Check documentation if styles are missing.

import styles from './styles.module.scss';
import type { CarouselProps } from './types/card.type';

// O <T> torna o componente genérico para qualquer tipo de array de itens.
const Carousel = <T,>({ items, renderItem, swiperOptions }: CarouselProps<T>) => {
  const defaultOptions: SwiperOptions = {
    // 2. Adicione o Autoplay na lista de módulos
    modules: [Navigation, Pagination, A11y, Autoplay], 
    spaceBetween: 50,
    slidesPerView: 1,
    navigation: true,
    pagination: { clickable: true },
    loop: true,
  };

  return (
    <Swiper {...defaultOptions} {...swiperOptions} className={styles.mySwiper}>
      {items.map((item, index) => (
        <SwiperSlide key={index} className={styles.swiperSlide}>
          {renderItem(item)}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;
