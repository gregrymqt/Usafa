import { useState, useEffect, useCallback } from "react";
import { SearchPics } from "../services/home.service"; // Ajuste o caminho
import type { ServicePic } from "../types/home.type"; // Ajuste o caminho
import { useInfiniteScroll } from "../../../shared/utils/forPages.utils";

export const useHomeLogic = () => {
  // 1. Estado do Carrossel Principal
  const [mainCarouselImages, setMainCarouselImages] = useState<ServicePic[]>([]);

  // 2. Estados da Galeria (Scroll Infinito)
  const [galleryItems, setGalleryItems] = useState<ServicePic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // --- EFEITO 1: Carregar Carrossel Principal ---
  useEffect(() => {
    const fetchMainImages = async () => {
      try {
        const images = await SearchPics(1, 5);
        setMainCarouselImages(images);
      } catch (error) {
        console.error("Erro ao carregar carrossel", error);
      }
    };
    fetchMainImages();
  }, []);

  // --- FUNÇÃO: Carregar mais fotos (Callback) ---
  const loadMorePhotos = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await SearchPics(page);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setGalleryItems((prev) => [...prev, ...newItems]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Erro ao buscar fotos da galeria:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // --- EFEITO 2: Carga Inicial da Galeria ---
  useEffect(() => {
    loadMorePhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HOOK de Scroll Infinito ---
  const { lastElementRef } = useInfiniteScroll(loadMorePhotos, hasMore, loading);

  // Retorna apenas o que a UI precisa para renderizar
  return {
    mainCarouselImages,
    galleryItems,
    loading,
    hasMore,
    lastElementRef,
  };
};