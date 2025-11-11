// services/api.ts
import { type GeoLocation } from '../types';
import api from '../../../shared/services/api';

// --- Tipos ---

// (Seu tipo 'Usafa' de 'usafaData.ts' é para a *lista estática*)
// Este é o tipo para o que salvamos no *banco de dados*
export interface SavedLocation {
  id: number; // ID do banco de dados
  userPublicId: string;
  usafaName: string; // Nome da USAFA mais próxima
  cep: string;      // CEP que o usuário digitou
}

// Para criar ou atualizar, não precisamos do 'id' ou 'userPublicId' no corpo
type LocationPayload = Omit<SavedLocation, 'id' | 'userPublicId'>;

// ... (interface do GeocodingResponse continua a mesma) ...
interface GeocodingResult {
  geometry: { location: GeoLocation };
}
interface GeocodingResponse {
  results: GeocodingResult[];
  status: 'OK' | 'ZERO_RESULTS' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT';
}


/**
 * GET: (O "select" que você pediu)
 * Busca a localização salva no banco de dados referente ao publicId do usuário.
 */
export const getSavedLocation = async (publicId: string): Promise<SavedLocation | null> => {
  try {
    // Vamos supor que seu endpoint GET seja /api/v1/usafas/user/{publicId}
    const response = await api.get<SavedLocation>(`/api/v1/usafas/user/${publicId}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // Usuário não tem localização salva (não é um erro)
    }
    console.error('Erro ao buscar localização salva:', error);
    throw error;
  }
};

/**
 * (Seu 'getCoordinatesFromCep' original - sem alterações)
 * Busca as coordenadas (lat/lng) de um CEP usando a API de Geocoding do Google.
 */
export const getCoordinatesFromCep = async (cep: string): Promise<GeoLocation> => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Google Maps não configurada.');
  }
  const geoURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}, Brasil&key=${apiKey}`;

  try {
    const response = await fetch(geoURL);
    const data: GeocodingResponse = await response.json();

    if (!response.ok || data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(data.status === 'ZERO_RESULTS' ? 'CEP não encontrado.' : 'Erro ao buscar coordenadas do CEP.');
    }
    return data.results[0].geometry.location;
  } catch (error) {
    console.error('Falha ao buscar na API do Google:', error);
    throw new Error('Não foi possível conectar à API de geolocalização.');
  }
};


/**
 * POST: (O "salvar no banco de dados se for a 1 vez")
 * (Anteriormente 'sendUsafaData', agora mais específico)
 */
export const createSavedLocation = async (locationData: LocationPayload, publicId: string): Promise<SavedLocation> => {
  try {
    // A rota POST /api/v1/usafas
    // Enviamos os dados E o publicId (assumindo que o backend espera)
    const response = await api.post<SavedLocation>('/api/v1/usafas', {
      ...locationData,
      userPublicId: publicId // Adiciona o publicId
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Erro ao criar localização (POST):', error);
    throw error;
  }
};

/**
 * PUT: (O "put com o cep novo")
 * Atualiza uma localização existente no banco.
 */
export const updateSavedLocation = async (locationId: number, locationData: LocationPayload): Promise<SavedLocation> => {
  try {
    // A rota PUT /api/v1/usafas/{id}
    const response = await api.put<SavedLocation>(`/api/v1/usafas/${locationId}`, locationData);
    return response.data;
  } catch (error: unknown) {
    console.error('Erro ao atualizar localização (PUT):', error);
    throw error;
  }
};