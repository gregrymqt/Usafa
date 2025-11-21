import { useState, useRef, useCallback, useEffect } from "react";

export interface Page<T> {
  /** A lista de itens para a página atual. */
  content: T[];

  /** O número total de páginas disponíveis. */
  totalPages: number;

  /** O número total de elementos em todas as páginas. */
  totalElements: number;

  /** O tamanho da página (quantos itens por página). */
  size: number;

  /** O número da página atual (baseado em zero). */
  number: number;

  /** Verdadeiro se esta for a última página. */
  last: boolean;

  /** Verdadeiro se a página atual não tiver elementos. */
  empty: boolean;
}

/**
 * Hook customizado para gerenciar a lógica de paginação do lado do cliente,
 * ideal para ser usado com dados de uma API paginada (que retorna um objeto Page<T>).
 * @param pageData - O objeto de página retornado pela API.
 * @param onPageChange - Callback executado quando a página muda.
 */
export const usePagination = ({
  pageData,
  onPageChange,
}: {
  pageData: Page<unknown> | undefined;
  onPageChange: (page: number) => void;
}) => {
  // O número da página atual (base 0) vindo da API.
  const currentPage = pageData?.number ?? 0;
  // O número total de páginas vindo da API.
  const totalPages = pageData?.totalPages ?? 1;

  const goToPage = (pageNumber: number) => {
    // Garante que a página esteja dentro dos limites válidos (0 a totalPages-1)
    const targetPage = Math.max(0, Math.min(pageNumber, totalPages - 1));
    if (targetPage !== currentPage) {
      onPageChange(targetPage);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  return {
    // Retorna a página atual em base 1 para exibição na UI
    currentPage: currentPage + 1,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < totalPages - 1,
    canGoPrev: currentPage > 0,
  };
};

/**
 * Hook para implementar a funcionalidade de "scroll infinito".
 * @param callback A função a ser chamada quando o usuário se aproxima do fim da lista.
 * @param hasMore Indica se há mais itens para carregar.
 * @param isLoading Indica se uma carga já está em andamento.
 */
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
) => {
  const observer = useRef<IntersectionObserver | null>(null);

  // useCallback para memorizar a referência do nó e re-criar o observer apenas quando necessário
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, callback],
  );

  return { lastElementRef };
};

/**
 * Hook para "atrasar" a atualização de um valor.
 * Muito útil para campos de busca, para evitar uma chamada à API a cada tecla.
 * @param value O valor a ser "atrasado" (ex: o texto de um input).
 * @param delay O tempo de atraso em milissegundos (padrão: 500ms).
 * @returns O valor após o atraso.
 */
export const useDebounce = <T>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um timer que só vai atualizar o valor "debounced" após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza: é chamada se o `value` ou `delay` mudarem antes do timer acabar.
    // Isso cancela o timer anterior e inicia um novo, reiniciando a contagem.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda o efeito apenas se o valor ou o delay mudarem

  return debouncedValue;
};
