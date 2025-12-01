import { useState, useEffect, useMemo } from 'react';
import { getHomeContent } from '../services/home.service';
import { HomeContent } from '../types/home.type';

export const useHomeLogic = () => {
  const [allContent, setAllContent] = useState<HomeContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getHomeContent();
      setAllContent(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // O Backend já filtrou isActive=true, então filtramos apenas pelo TYPE aqui.

  const carouselItems = useMemo(() => 
    allContent.filter(item => item.type === 'CAROUSEL_MAIN'), 
  [allContent]);

  const serviceItems = useMemo(() => 
    allContent.filter(item => item.type === 'SERVICE_CARD'), 
  [allContent]);

  // Pega o primeiro 'About' que encontrar
  const aboutItem = useMemo(() => 
    allContent.find(item => item.type === 'ABOUT_SECTION'), 
  [allContent]);

  const galleryItems = useMemo(() => 
    allContent.filter(item => item.type === 'GALLERY_PHOTO'), 
  [allContent]);

  return {
    loading,
    carouselItems,
    serviceItems,
    aboutItem,
    galleryItems
  };
};