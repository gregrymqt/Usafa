// services/api.ts
import {
  BrasilApiResponse,
  type GeoLocation,
  type LocationPayload,
  type SavedLocation,
} from "../types/maps.type";
import api from "../../../shared/services/api.service";
import { isAxiosError } from "axios";

/**
 * GET: (O "select" que você pediu)
 * Busca a localização salva no banco de dados referente ao publicId do usuário.
 */
export const getSavedLocation = async (
  publicId: string
): Promise<SavedLocation | null> => {
  try {
    // Vamos supor que seu endpoint GET seja /api/v1/usafas/user/{publicId}
    const response = await api.get<SavedLocation>(
      `/api/v1/usafas/user/${publicId}`
    );
    return response;
  } catch (error: unknown) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null; // Usuário não tem localização salva (não é um erro)
    }
    console.error("Erro ao buscar localização salva:", error);
    throw error;
  }
};

/**
 * (Seu 'getCoordinatesFromCep' original - sem alterações)
 * Busca as coordenadas (lat/lng) de um CEP usando a API de Geocoding do Google.
 */
export const getCoordinatesFromCep = async (cep: string): Promise<GeoLocation> => {
  try {
    const response = await api.get<BrasilApiResponse>(`/api/v1/maps/geocode?cep=${cep}`);
    
    // O Axios devolve o corpo em response.data
    const data = response; 

    // Debug para você ver no Console do Navegador (F12) o que chegou
    console.log("Dados recebidos do Backend:", data);

    if (!data.location || !data.location.coordinates) {
      throw new Error('Sem coordenadas.');
    }

    const lat = Number(data.location.coordinates.latitude);
    const lng = Number(data.location.coordinates.longitude);

    // Se vier 0 ou null, lança erro
    if (!lat || !lng) throw new Error('Coordenadas inválidas.');

    return { lat, lng };

  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * POST: (O "salvar no banco de dados se for a 1 vez")
 * (Anteriormente 'sendUsafaData', agora mais específico)
 */
export const createSavedLocation = async (
  locationData: LocationPayload,
  publicId: string
): Promise<SavedLocation> => {
  try {
    // A rota POST /api/v1/usafas
    // Enviamos os dados E o publicId (assumindo que o backend espera)
    const response = await api.post<SavedLocation>("/api/v1/usafas", {
      ...locationData,
      userPublicId: publicId, // Adiciona o publicId
    });
    return response;
  } catch (error: unknown) {
    console.error("Erro ao criar localização (POST):", error);
    throw error;
  }
};

/**
 * PUT: (O "put com o cep novo")
 * Atualiza uma localização existente no banco.
 */
export const updateSavedLocation = async (
  locationId: number,
  locationData: LocationPayload
): Promise<SavedLocation> => {
  try {
    // A rota PUT /api/v1/usafas/{id}
    const response = await api.put<SavedLocation>(
      `/api/v1/usafas/${locationId}`,
      locationData
    );
    return response;
  } catch (error: unknown) {
    console.error("Erro ao atualizar localização (PUT):", error);
    throw error;
  }
};
