import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type ModalProps } from './types/Modal.types.tsx';
import styles from './Modal.module.scss';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  hideCloseButton = false
}) => {

  // Efeito para travar o scroll do <body> quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Limpa o efeito ao desmontar
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Não renderiza nada se estiver fechado
  if (!isOpen) {
    return null;
  }

  // Permite fechar clicando no backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Verifica se o clique foi no backdrop e não no conteúdo
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className={styles.modalBackdrop} 
      onClick={handleBackdropClick} 
      role="dialog" 
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className={`${styles.modalContent} ${title ? styles.withTitle : ''}`}>
        
        {/* Cabeçalho Condicional */}
        {(title || !hideCloseButton) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button 
                className={styles.closeButton} 
                onClick={onClose} 
                aria-label="Fechar"
              >
                &times;
              </button>
            )}
          </div>
        )}

        {/* Corpo do Modal (Conteúdo Genérico) */}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );

  // Usa createPortal para renderizar o modal no final do <body>
  // Isso resolve problemas de z-index e stacking context.
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    // Fallback caso 'modal-root' não exista (embora deva existir no index.html)
    return modalContent; 
  }

  return createPortal(modalContent, modalRoot);
};

// **IMPORTANTE**: Adicione este elemento no seu `index.html`
// (geralmente dentro do <body>, logo após o <div id="root">)
// <div id="modal-root"></div>