import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination, A11y } from 'swiper/modules';

// Note: Swiper v12 may handle CSS differently. Check documentation if styles are missing.

import styles from './styles.module.scss';
import type { CarouselProps } from './types/card.type';

// O <T> torna o componente genérico para qualquer tipo de array de itens.
const Carousel = <T,>({ items, renderItem, swiperOptions }: CarouselProps<T>) => {
  // Opções padrão que podem ser sobrescritas pela prop `swiperOptions`
  const defaultOptions: SwiperOptions = {
    modules: [Navigation, Pagination, A11y],
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
