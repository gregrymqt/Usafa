import api from '../../../shared/services/api.service';
import { HomeContent } from '../types/home.type';

export const getHomeContent = async (): Promise<HomeContent[]> => {
  try {
    // Chama o endpoint que você mostrou: @GetMapping public ResponseEntity<List<HomeContentDto>>...
    const response = await api.get<HomeContent[]>('/home/content');
    return response || []; // Garante retorno de array
  } catch (error) {
    console.error("Erro ao buscar conteúdo da home", error);
    return [];
  }
};