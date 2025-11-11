import { useState, useEffect, useCallback } from 'react';
import { USAFAS } from '../../../components/Maps/data/usafaData';
import { getCoordinatesFromCep } from '../../../components/Maps/services/api';
import type { Usafa, GeoLocation } from '../../../components/Maps/types';
import { getHaversineDistance } from '../../../components/Maps/utils/geolocation';

/**
 * Este hook "apenas calcula". Ele não salva (POST/PUT) nada.
 * Ele recebe um CEP e retorna a USAFA mais próxima.
 */
export const useUsafaCalculator = (cep: string) => {
  const [maisProxima, setMaisProxima] = useState<Usafa | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [distancia, setDistancia] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calcularMaisProxima = useCallback(async (cepParaBuscar: string) => {
    setIsLoading(true);
    setError(null);
    setMaisProxima(null);

    const cepLimpo = cepParaBuscar.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setError('CEP inválido no perfil.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Busca coordenadas (Google)
      const userLoc = await getCoordinatesFromCep(cepLimpo);
      setUserLocation(userLoc);

      // 2. Calcula distância (Local)
      let localMaisProximo: Usafa | null = null;
      let menorDistancia = Infinity;

      for (const usafa of USAFAS) {
        const dist = getHaversineDistance(userLoc, { lat: usafa.lat, lng: usafa.lng });
        if (dist < menorDistancia) {
          menorDistancia = dist;
          localMaisProximo = usafa;
        }
      }

      if (localMaisProximo) {
        setMaisProxima(localMaisProximo);
        setDistancia(menorDistancia);
      } else {
        setError('Não foi possível encontrar uma USAFA próxima.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Roda o cálculo automaticamente sempre que o CEP (prop) mudar
  useEffect(() => {
    if (cep) {
      calcularMaisProxima(cep);
    }
  }, [cep, calcularMaisProxima]);

  return {
    isLoading,
    error,
    maisProxima,
    userLocation,
    distancia
  };
};