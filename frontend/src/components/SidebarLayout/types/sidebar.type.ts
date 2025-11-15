import type { ReactNode } from 'react';

/**
 * Define o contrato para cada "aba" ou "visão" que
 * o SidebarLayout irá gerenciar.
 */
export interface ISidebarView {
  /** O nome que será exibido na aba. */
  name: string;

  /** O ícone (como JSX) para a aba. */
  icon: ReactNode;

  /** O componente da "Partial View" a ser renderizado. */
  component: ReactNode;
}