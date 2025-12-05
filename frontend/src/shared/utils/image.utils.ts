// src/shared/utils/image.utils.ts

/**
 * Resolve a URL completa de uma imagem.
 * - Se for nulo/vazio: retorna null.
 * - Se for link externo (http/https): retorna o link original.
 * - Se for local: concatena com a URL do Backend Spring (/uploads).
 */
export const getImageUrl = (imageName: string | null | undefined): string | null => {
  if (!imageName || imageName.trim() === '') {
    return null;
  }

  // Verifica se é uma URL externa (Google, Facebook, etc.)
  if (imageName.startsWith('http') || imageName.startsWith('https')) {
    return imageName;
  }

  // Se for imagem local salva pelo Spring, monta a URL completa
  return `http://localhost:8080${imageName}`;
};