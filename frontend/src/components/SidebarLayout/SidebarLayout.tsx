import React, { useState } from 'react';
import styles from './SidebarLayout.module.scss';
import { MenuIcon, CloseIcon } from './Icons'; // Ícones SVG simples
import type { ISidebarView } from './types/sidebar.type';

// --- Props ---
interface SidebarLayoutProps {
  /** A lista de visões parciais para gerenciar. */
  views: ISidebarView[];
  
  /** O título ou logo a ser exibido no topo da sidebar. */
  brandLogo: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ views, brandLogo }) => {
  // Estado para a aba ativa (começa com a primeira)
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Estado para o menu mobile (começa fechado)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // --- Handlers ---

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen(prev => !prev);
  };

  const handleSelectView = (index: number) => {
    setActiveIndex(index);
    // Fecha o menu mobile ao selecionar uma aba (melhor UX)
    setIsMobileNavOpen(false);
  };

  // --- Renderização ---

  const activeView = views[activeIndex];

  return (
    <div className={styles.layoutContainer}>
      
      {/* 1. HEADER (Aparece apenas no Mobile) */}
      <header className={styles.mobileHeader}>
        <button onClick={handleToggleMobileNav} className={styles.menuButton}>
          <MenuIcon />
        </button>
        {/* Mostra o nome da aba ativa no header */}
        <span className={styles.mobileHeaderText}>{activeView.name}</span>
      </header>

      {/* 2. OVERLAY (Fundo escuro no Mobile) */}
      {isMobileNavOpen && (
        <div className={styles.overlay} onClick={handleToggleMobileNav} />
      )}

      {/* 3. SIDEBAR (Navegação) */}
      <aside 
        className={`${styles.sidebar} ${isMobileNavOpen ? styles.isOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          {/* Logo/Marca */}
          <div className={styles.brand}>
            {brandLogo}
          </div>
          {/* Botão de fechar (Aparece só no Mobile) */}
          <button onClick={handleToggleMobileNav} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            {views.map((view, index) => (
              <li key={view.name}>
                <button
                  className={`${styles.navButton} ${
                    index === activeIndex ? styles.active : ''
                  }`}
                  onClick={() => handleSelectView(index)}
                >
                  <span className={styles.icon}>{view.icon}</span>
                  <span className={styles.name}>{view.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 4. CONTENT (Área da Partial View) */}
      <main className={styles.contentArea}>
        {/* Renderiza o componente da aba ativa */}
        {activeView.component}
      </main>
      
    </div>
  );
};