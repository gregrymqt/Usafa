import React, { useState, useEffect } from "react";
import Carousel from "../../components/Carousel";
import ServicesSection from "./components/ServicesSection";
import AboutSection from "./components/AboutSection";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { SearchPics, type ServicePic } from "./services/api";
import styles from "./styles.module.scss";

const Home: React.FC = () => {
  // 1. Carrossel principal (primeira impressão)
  const [mainCarouselImages, setMainCarouselImages] = useState<ServicePic[]>([]);

  // Hook para o scroll infinito
  const { items: infiniteScrollItems, loading, hasMore } = useInfiniteScroll();

  // Busca as imagens para o carrossel principal quando o componente montar
  useEffect(() => {
    const fetchMainImages = async () => {
      const images = await SearchPics(1, 5); // Busca 5 imagens da página 1
      setMainCarouselImages(images);
    };
    fetchMainImages();
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Seção 1: Carrossel Principal */}
      <section className={styles.mainCarouselSection}>
        <Carousel
          items={mainCarouselImages}
          renderItem={(item) => (
            <img
              src={item.url} // Agora usa a URL vinda da API
              alt={item.title} // Usa o título vindo da API
              className={styles.mainCarouselImage}
            />
          )}
          swiperOptions={{
            pagination: { clickable: true },
            autoplay: { delay: 5000, disableOnInteraction: false },
          }}
        />
      </section>

      {/* Seção 2: Carrossel de Serviços com Cards */}
      <section>
        <ServicesSection />
      </section>

      {/* Seção 3: Sobre Nós */}
      <AboutSection />

      {/* Seção Bônus: Scroll Infinito de Fotos */}
      <section className={styles.infiniteScrollSection}>
        <h2>Galeria de Fotos</h2>
        <div className={styles.galleryGrid}>
          {infiniteScrollItems.map((item) => (
            <div key={item.id} className={styles.galleryItem}>
              <img src={item.url} alt={item.title} />
            </div>
          ))}
        </div>
        {loading && <p className={styles.loader}>Carregando mais fotos...</p>}
        {!hasMore && <p className={styles.endMessage}>Você chegou ao fim!</p>}
      </section>
    </div>
  );
};

export default Home;
