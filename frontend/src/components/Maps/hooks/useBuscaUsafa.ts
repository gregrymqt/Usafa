// hooks/useBuscaUsafa.ts

import { useState, useCallback } from 'react';
import { USAFAS } from '../data/usafaData';
import { type GeoLocation, type Usafa } from '../types';
import {
  getCoordinatesFromCep,
  getSavedLocation,    // <--- ADICIONADO (GET)
  createSavedLocation, // <--- ADICIONADO (POST)
  updateSavedLocation, // <--- ADICIONADO (PUT)
  type SavedLocation    // <--- ADICIONADO (Tipo do DB)
} from '../services/api';
import { getHaversineDistance } from '../utils/geolocation';

// Interface para o que o Hook retorna (Atualizada)
export interface UseBuscaUsafaReturn {
  distancia: number;
  userLocation: GeoLocation | null;
  maisProxima: Usafa | null;
  savedLocation: SavedLocation | null; // <-- O que está salvo no DB
  isLoading: boolean;
  error: string | null;
  loadSavedLocation: (publicId: string) => Promise<void>; // <-- Método GET
  handleBuscar: (cep: string, publicId: string) => Promise<void>; // <-- Método POST/PUT
}

export const useBuscaUsafa = (): UseBuscaUsafaReturn => {
  // --- Estados do *Resultado da Busca* ---
  const [maisProxima, setMaisProxima] = useState<Usafa | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [distancia, setDistancia] = useState<number>(0);
  
  // --- Estado do *Dado Salvo no DB* ---
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);

  // --- Estados de Controle ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * MÉTODO GET (O "select" que você pediu)
   * Roda 1 vez para saber se o usuário já tem dados.
   */
  const loadSavedLocation = useCallback(async (publicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSavedLocation(publicId);
      setSavedLocation(data); // Salva o que veio do banco (pode ser null)
    } catch (err) {
      // Não tratamos 404 como erro, apenas erro de conexão
      setError("Falha ao carregar dados salvos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * MÉTODO POST/PUT (Seu "getUsafa" / "handleBuscar" modificado)
   */
  const handleBuscar = useCallback(async (cep: string, publicId: string) => {
    setIsLoading(true);
    setError(null);
    setMaisProxima(null);
    setUserLocation(null);
    setDistancia(0);

    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      setError('CEP inválido. Digite um CEP com 8 dígitos.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Busca as coordenadas do CEP (Geocoding)
      const userLoc = await getCoordinatesFromCep(cepLimpo);
      setUserLocation(userLoc);

      // 2. Calcula a distância (Lógica original)
      let localMaisProximo: Usafa | null = null;
      let menorDistancia = Infinity;

      for (const usafa of USAFAS) {
        const dist = getHaversineDistance(userLoc, { lat: usafa.lat, lng: usafa.lng });
        if (dist < menorDistancia) {
          menorDistancia = dist;
          localMaisProximo = usafa;
        }
      }

      // 3. Define o resultado da *busca* no estado
      if (localMaisProximo) {
        setMaisProxima(localMaisProximo);
        setDistancia(menorDistancia);

        // 4. LÓGICA DE POST/PUT (A lógica nova que você pediu)
        const dataToSave = {
          usafaName: localMaisProximo.nome, // Nome da USAFA encontrada
          cep: cepLimpo                      // CEP que o usuário digitou
        };

        if (savedLocation && savedLocation.id) {
          // --- LÓGICA PUT ---
          // ("pois com o cep novo digitado temos que mudar os dados")
          const updated = await updateSavedLocation(savedLocation.id, dataToSave);
          setSavedLocation(updated); // Atualiza o estado com o novo dado salvo
        } else {
          // --- LÓGICA POST ---
          // ("salvar no banco de dados se for a 1 vez")
          const created = await createSavedLocation(dataToSave, publicId);
          setSavedLocation(created); // Atualiza o estado com o novo dado salvo
        }

      } else {
        setError('Não foi possível encontrar uma USAFA próxima.');
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao buscar o CEP.');
      }
    } finally {
      setIsLoading(false);
    }
    // 'savedLocation' é uma dependência para decidir entre POST e PUT
  }, [savedLocation]); 

  return {
    maisProxima,
    userLocation,
    distancia,
    isLoading,
    error,
    savedLocation, // <-- Retorna o dado salvo
    loadSavedLocation, // <-- Retorna o método GET
    handleBuscar,
  };
};