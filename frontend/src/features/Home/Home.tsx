import React from "react";
import Carousel from "../../components/Carousel/Carousel";
import ServicesSection from "./components/ServicesSection/Service";
import AboutSection from "./components/AboutSection/About";
import styles from "./styles.module.scss";
import { useHomeLogic } from "./hooks/useHomeLogic"; // Importe o hook que criamos acima

const Home: React.FC = () => {
  // Toda a lógica é consumida em uma linha
  const { 
    mainCarouselImages, 
    galleryItems, 
    loading, 
    hasMore, 
    lastElementRef 
  } = useHomeLogic();

  return (
    <div className={styles.homeContainer}>
      {/* Seção 1: Carrossel Principal */}
      <section className={styles.mainCarouselSection}>
        <Carousel
          items={mainCarouselImages}
          renderItem={(item) => (
            <img
              src={item.url}
              alt={item.title}
              className={styles.mainCarouselImage}
            />
          )}
          swiperOptions={{
            pagination: { clickable: true },
            autoplay: { delay: 5000, disableOnInteraction: false },
            slidesPerView: 1,
            spaceBetween: 10,
            breakpoints: {
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 30 },
              1400: { slidesPerView: 4, spaceBetween: 40 },
            },
          }}
        />
      </section>

      {/* Seção 2: Serviços */}
      <section>
        <ServicesSection />
      </section>

      {/* Seção 3: Sobre Nós */}
      <AboutSection />

      {/* Seção Bônus: Scroll Infinito de Fotos */}
      <section className={styles.infiniteScrollSection}>
        <h2>Galeria de Fotos</h2>
        <div className={styles.galleryGrid}>
          {galleryItems.map((item, index) => {
            const isLastItem = galleryItems.length === index + 1;
            return (
              <div
                key={item.id}
                ref={isLastItem ? lastElementRef : null}
                className={styles.galleryItem}
              >
                <img src={item.url} alt={item.title} />
              </div>
            );
          })}
        </div>

        {loading && <p className={styles.loader}>Carregando mais fotos...</p>}
        {!hasMore && <p className={styles.endMessage}>Você chegou ao fim!</p>}
      </section>
    </div>
  );
};

export default Home;