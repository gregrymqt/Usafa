import { type ReactNode } from 'react';

export interface ModalProps {
  /**
   * Controla se o modal está visível ou não.
   */
  isOpen: boolean;
  /**
   * Função chamada quando o usuário clica no backdrop ou no botão de fechar.
   */
  onClose: () => void;
  /**
   * Título opcional exibido no cabeçalho do modal.
   */
  title?: string;
  /**
   * O conteúdo (ReactNode) a ser renderizado dentro do modal.
   */
  children: ReactNode;
  /**
   * Opcional: Esconde o botão 'x' de fechar (para forçar uma ação).
   */
  hideCloseButton?: boolean;
}