import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Criamos uma instância do Swal que pode renderizar React
const MySwal = withReactContent(Swal);

/**
 * Exibe um toast de sucesso simples.
 * @param title Título do toast
 */
export const showSuccessToast = (title: string) => {
  MySwal.fire({
    title,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

/**
 * Exibe um toast de erro simples.
 * @param title Título do toast
 */
export const showErrorToast = (title: string) => {
  MySwal.fire({
    title,
    icon: 'error',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

/**
 * Exibe um modal de confirmação de deleção.
 * @param name Nome do item a ser deletado (ex: "Dr. House")
 * @returns Promise<boolean> - true se o usuário confirmar
 */
export const showDeleteConfirm = async (name: string): Promise<boolean> => {
  const result = await MySwal.fire({
    title: 'Você tem certeza?',
    text: `Você está prestes a deletar: ${name}. Esta ação não pode ser revertida.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, deletar!',
    cancelButtonText: 'Cancelar',
  });

  return result.isConfirmed;
};

// --- Stubs de Funcionalidades Futuras ---

/**
 * Lógica de paginação
 * TODO: Implementar
 */
export const usePagination = () => {
  console.warn('usePagination hook não implementado.');
  // Lógica de paginação (estado de página atual, total de páginas, etc.)
  return {
    currentPage: 1,
    totalPages: 1,
    // setPage: () => {},
  };
};

/**
 * Lógica de Infinite Scroll
 * TODO: Implementar
 */
export const useInfiniteScroll = (callback: () => void) => {
  console.warn('useInfiniteScroll hook não implementado.');
  // Lógica com IntersectionObserver para chamar o callback
  // quando o usuário chegar ao fim da página.
};