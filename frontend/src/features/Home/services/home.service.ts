import api from '../../../shared/services/api.service';
import { HomeContent } from '../types/home.type';

export const getHomeContent = async (): Promise<HomeContent[]> => {
  try {
    // ATENÇÃO: Mudamos para /public para pegar o Cache e apenas itens ativos
    const data  = await api.get<HomeContent[]>('/home/content/public');
    return data || []; 
  } catch (error) {
    console.error("Erro ao buscar conteúdo da home", error);
    return [];
  }
};