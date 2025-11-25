// services/api.ts
import { type GeocodingResponse, type GeoLocation, type LocationPayload, type SavedLocation } from '../types/maps.type';
import api from '../../../shared/services/api.service';
import { isAxiosError } from 'axios';


/**
 * GET: (O "select" que você pediu)
 * Busca a localização salva no banco de dados referente ao publicId do usuário.
 */
export const getSavedLocation = async (publicId: string): Promise<SavedLocation | null> => {
  try {
    // Vamos supor que seu endpoint GET seja /api/v1/usafas/user/{publicId}
    const response = await api.get<SavedLocation>(`/api/v1/usafas/user/${publicId}`);
    return response;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
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
  try {
    // Agora chama o nosso backend, que é mais seguro
    const response = await api.get<GeocodingResponse>(`/api/v1/maps/geocode?cep=${cep}`);
    const data = response; // O 'api.service' já extrai o 'data'
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(data.status === 'ZERO_RESULTS' ? 'CEP não encontrado.' : 'Erro ao buscar coordenadas do CEP.');
    }
    return data.results[0].geometry.location;
  } catch (error) {
    console.error('Falha ao buscar geolocalização no backend:', error);
    throw new Error('Não foi possível obter as coordenadas do CEP.');
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
    return response;
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
    return response;
  } catch (error: unknown) {
    console.error('Erro ao atualizar localização (PUT):', error);
    throw error;
  }
};