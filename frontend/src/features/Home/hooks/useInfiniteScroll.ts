import { useState, useEffect, useCallback } from "react";
import { type ServicePic, SearchPics } from "../services/api";

export const useInfiniteScroll = () => {
  const [items, setItems] = useState<ServicePic[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Aqui usamos a chamada da API que você especificou
      const newItems = await SearchPics(page);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems((prevItems) => [...prevItems, ...newItems]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Falha ao buscar mais itens:", error);
      // Poderia-se adicionar um estado de erro aqui
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Efeito para carregar os itens iniciais
  useEffect(() => {
    loadMore();
  }, [loadMore]); // Executa apenas na montagem inicial

  // Efeito para detectar quando o usuário chega ao final da página
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 100 ||
        loading
      ) {
        return;
      }
      loadMore();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadMore]);

  return { items, loading, hasMore };
};
