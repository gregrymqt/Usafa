import api from '../../../shared/services/api'; 
// Removido: import type { AxiosResponse } from 'axios';

// A interface permanece a mesma
export interface ServicePic {
  id: string;
  url: string;
  title: string;
}

/**
 * Busca fotos da API real com paginação (usando fetch).
 * @param page - O número da página a ser buscada.
 * @param limit - Quantidade de itens por página.
 * @returns Uma promessa que resolve para um array de ServicePic.
 */
export const SearchPics = async (page: number = 1, limit: number = 5): Promise<ServicePic[]> => {
  try {
    console.log(`Buscando fotos da API: página ${page}, limite ${limit}`);

    // --- MUDANÇA AQUI ---
    // 1. O fetch não tem 'params', então criamos a query string manualmente.
    const params = new URLSearchParams({ 
      page: String(page), 
      size: String(limit) 
    });

    // 2. Chamamos api.get com a URL completa
    const data: ServicePic[] = await api.get(`/pictures?${params.toString()}`);
    
    // 3. Nosso wrapper fetch já retorna os dados (não 'response.data')
    return data;

  } catch (error) {
    console.error("Falha ao buscar fotos da API:", error);
    return []; // Retorna um array vazio em caso de erro [cite: 18]
  }
};