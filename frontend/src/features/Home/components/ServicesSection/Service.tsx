import React, { useState, useEffect } from "react";
// Se certifique que o caminho do import está correto na sua pasta
import Carousel from "../../../../components/Carousel/Carousel"; 
import styles from "./Service.module.scss";
import type { SwiperOptions } from "swiper/types";
import { Card } from "../../../../components/Card/Card";
import type { CardData } from "./types/servicesSection.types";

// 1. DADOS SIMPLIFICADOS: Um único array com tudo (não array de arrays)
const sectionsTextData: Omit<CardData, 'imageUrl'>[] = [
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
];

const ServicesSection: React.FC = () => {
  const [items, setItems] = useState<CardData[]>([]);

  // 2. CARREGAMENTO DE IMAGENS (Simulado)
  useEffect(() => {
    const dataWithImages = sectionsTextData.map((card, index) => ({
      ...card,
      // Usando picsum com ID fixo baseado no index para não mudar a cada render
      imageUrl: `https://picsum.photos/400/300?random=${index + 10}`
    }));
    setItems(dataWithImages);
  }, []);

  // 3. CONFIGURAÇÃO DO CARROSSEL (Isso define as colunas)
  const cardCarouselOptions: SwiperOptions = {
    pagination: { clickable: true }, // Habilita bolinhas de navegação
    navigation: true, // Habilita setas padrão do componente
    loop: true, // Permite girar infinitamente
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },
    // CONFIGURAÇÃO DE COLUNAS:
    slidesPerView: 1, // Celular: 1 coluna (ocupando tudo)
    spaceBetween: 20,
    breakpoints: {
      640: {
        slidesPerView: 2, // Tablet pequeno: 2 colunas
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3, // Desktop: 3 colunas
        spaceBetween: 30,
      },
      1400: {
         slidesPerView: 4, // Telas grandes: 4 colunas
         spaceBetween: 30,
      }
    },
  };

  return (
    <section className={styles.servicesContainer}>
      <h2>Nossos Serviços</h2>
      
      <div className={styles.carouselWrapper}>
        {items.length > 0 && (
          <Carousel
            items={items}
            renderItem={(card) => (
                // O Card deve ter width 100% para preencher a coluna do carousel
                <div style={{ width: '100%' }}> 
                    <Card
                      title={card.title}
                      description={card.description}
                      imageUrl={card.imageUrl}
                    >
                      {/* Tudo que está aqui dentro é o 'children' */}
                      <a href="#" className={styles.cardActionLink}>Saiba mais</a>
                    </Card>
                </div>
            )}
            swiperOptions={cardCarouselOptions}
          />
        )}
      </div>
    </section>
  );
};

export default ServicesSection;