import React, { useState, useEffect } from "react";
import Carousel from "../../../../components/Carousel"; // Usando o Carousel global
import { useSectionManager } from "../../hooks/useSectionManager";
import styles from "./styles.module.scss";
import type { SwiperOptions } from "swiper/types";
import { Card } from "../../../../components/Card";
import type { CardData } from "./types/servicesSection.types";

// Dados de exemplo para os cards
const sectionsTextData: Omit<CardData, 'imageUrl'>[][] = [
  [
    {
      title: "Agendamento Online",
      description: "Marque suas consultas de forma rápida e fácil.",
    },
    {
      title: "Resultados de Exames",
      description: "Acesse seus resultados de exames com segurança.",
    },
    {
      title: "Histórico de Consultas",
      description: "Veja todo o seu histórico de atendimentos.",
    },
  ],
  [
    {
      title: "Vacinação",
      description: "Confira o calendário de vacinação e suas doses.",
    },
    {
      title: "Programas de Saúde",
      description: "Participe de programas de prevenção e bem-estar.",
    },
    {
      title: "Fale com a USAFA",
      description: "Canal direto para tirar suas dúvidas.",
    },
  ],
  [
    {
      title: "Nossas Unidades",
      description: "Encontre a USAFA mais próxima de você.",
    },
    {
      title: "Direitos e Deveres",
      description: "Conheça seus direitos como paciente do SUS.",
    },
    {
      title: "Notícias e Avisos",
      description: "Fique por dentro das novidades da saúde.",
    },
  ],
];

const ServicesSection: React.FC = () => {
  const [sectionsData, setSectionsData] = useState<CardData[][]>([]);
  const { currentSection, next, previous } = useSectionManager(
    sectionsTextData.length
  );

  // Busca as imagens para os cards quando o componente montar
  useEffect(() => {
    // Simula a busca de imagens para cada card.
    // Em um cenário real, a API poderia retornar os dados completos do card.
    const dataWithImages = sectionsTextData.map((section, sectionIndex) => 
      section.map((card, cardIndex) => {
        const imageId = 10 + sectionIndex * 3 + cardIndex;
        return {
          ...card,
          imageUrl: `https://picsum.photos/400/300?random=${imageId}` // Mantendo picsum aqui como placeholder
        }
      })
    );
    setSectionsData(dataWithImages);
  }, []);

  // Opções do Swiper para os cards, com responsividade (mobile-first)
  const cardCarouselOptions: SwiperOptions = {
    slidesPerView: 1.2, // Mostra 1 card e um pedaço do próximo no mobile
    spaceBetween: 15,
    pagination: false, // Desativa a paginação padrão para usar nossos botões
    loop: false, // O loop aqui pode confundir a navegação por seção
    navigation: false, // Desativa a navegação padrão
    breakpoints: {
      // A partir de 768px (tablets)
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      // A partir de 1024px (desktops)
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  };

  return (
    <div className={styles.servicesContainer}>
      <h2>Nossos Serviços</h2>
      <div className={styles.carouselWrapper}>
        <button onClick={previous} className={styles.navButton} aria-label="Seção anterior de serviços">
          ‹
        </button>
        {sectionsData.length > 0 && (
          <Carousel
            items={sectionsData[currentSection]}
            renderItem={(card) => <Card {...card}>{card.title}</Card>}
            swiperOptions={cardCarouselOptions}
          />
        )}
        <button onClick={next} className={styles.navButton} aria-label="Próxima seção de serviços">
          ›
        </button>
      </div>
    </div>
  );
};

export default ServicesSection;
