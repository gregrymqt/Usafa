import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import styles from './ActionMenu.module.scss';
import type { ActionMenuProps } from './types/actionMenu.type';

// Ícone de 3 pontinhos (Kebab Icon)
const KebabIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
  >
    <path d="M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);

export const ActionMenu: React.FC<ActionMenuProps> = ({ onUpdate, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Lida com o clique em "Atualizar".
   * Fecha o menu e chama a função 'onUpdate' recebida via prop.
   */
  const handleUpdateClick = () => {
    setIsOpen(false);
    onUpdate(); // Chama a função que o componente pai passou
  };

  /**
   * Lida com o clique em "Deletar".
   * Mostra a confirmação do Swal e SÓ CHAMA 'onDelete' se o usuário confirmar.
   */
  const handleDeleteClick = () => {
    setIsOpen(false);
    
    // UI/UX com SweetAlert
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter esta ação!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Só executa a função de deletar (que o pai passou) se confirmado
        onDelete(); 
        
        // Feedback de sucesso (opcional, mas bom para UX)
         Swal.fire('Deletado!', 'O item foi deletado.', 'success');
      }
    });
  };

  return (
    <div className={styles.actionMenu} ref={menuRef}>
      {/* Botão que abre o menu */}
      <button
        className={styles.menuButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <KebabIcon />
      </button>

      {/* O Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          <button onClick={handleUpdateClick} className={styles.dropdownItem}>
            Atualizar
          </button>
          <button onClick={handleDeleteClick} className={`${styles.dropdownItem} ${styles.delete}`}>
            Deletar
          </button>
        </div>
      )}
    </div>
  );
};