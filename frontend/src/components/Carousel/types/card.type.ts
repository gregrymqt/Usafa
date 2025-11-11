import type { SwiperOptions } from "swiper/types";

export interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  swiperOptions?: SwiperOptions;
}