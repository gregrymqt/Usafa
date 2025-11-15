/**
 * Props para o ActionMenu genérico.
 * Ele recebe as FUNÇÕES que deve executar.
 */
export interface ActionMenuProps {
  onUpdate: () => void; // Função a ser chamada ao clicar em "Atualizar"
  onDelete: () => void; // Função a ser chamada ao clicar em "Deletar"
}