import { type GeoLocation } from '../types';

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine.
 * Retorna a distância em quilômetros.
 *
 * @param loc1 Coordenadas do ponto 1 (usuário)
 * @param loc2 Coordenadas do ponto 2 (USAFA)
 * @returns Distância em KM
 */
export const getHaversineDistance = (loc1: GeoLocation, loc2: GeoLocation): number => {
  if (!loc1 || !loc2) return 0;

  const R = 6371; // Raio da Terra em km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c; // Distância em km

  return distancia;
};