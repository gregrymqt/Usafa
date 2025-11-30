import { useState, useEffect, useMemo } from 'react';
import { getHomeContent } from '../services/home.service';
import { HomeContent } from '../types/home.type';

export const useHomeLogic = () => {
  const [allContent, setAllContent] = useState<HomeContent[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Busca Única ao carregar a página
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getHomeContent();
      setAllContent(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // 2. Separa os dados por categoria usando useMemo (Performance)
  
  // Filtra itens para o Carrossel Principal
  const carouselItems = useMemo(() => 
    allContent.filter(item => item.type === 'CAROUSEL_MAIN' && item.isActive), 
  [allContent]);

  // Filtra itens para a Seção de Serviços
  const serviceItems = useMemo(() => 
    allContent.filter(item => item.type === 'SERVICE_CARD' && item.isActive), 
  [allContent]);

  // Filtra o item da Seção Sobre (Pega o primeiro que achar)
  const aboutItem = useMemo(() => 
    allContent.find(item => item.type === 'ABOUT_SECTION' && item.isActive), 
  [allContent]);

  // Filtra itens da Galeria
  const galleryItems = useMemo(() => 
    allContent.filter(item => item.type === 'GALLERY_PHOTO' && item.isActive), 
  [allContent]);

  return {
    loading,
    carouselItems,
    serviceItems,
    aboutItem,
    galleryItems
  };
};