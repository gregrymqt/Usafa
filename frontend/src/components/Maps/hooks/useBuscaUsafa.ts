// hooks/useBuscaUsafa.ts
import { useState, useCallback } from 'react';
import { USAFAS } from '../data/usafaData';
import { type GeoLocation, type SavedLocation, type Usafa } from '../types/maps.type';
import {
  getCoordinatesFromCep,
  getSavedLocation,
  createSavedLocation,
  updateSavedLocation,
} from '../services/maps.service';
import { getHaversineDistance } from '../utils/geolocation';

export const useBuscaUsafa = () => {
  const [maisProxima, setMaisProxima] = useState<Usafa | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [distancia, setDistancia] = useState<number>(0);
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lógica central de cálculo (separada para ser usada por CEP ou GPS)
  const calcularProximaESalvar = async (coords: GeoLocation, cepParaSalvar: string, publicId: string) => {
      let localMaisProximo: Usafa | null = null;
      let menorDistancia = Infinity;

      for (const usafa of USAFAS) {
        const dist = getHaversineDistance(coords, { lat: usafa.lat, lng: usafa.lng });
        if (dist < menorDistancia) {
          menorDistancia = dist;
          localMaisProximo = usafa;
        }
      }

      if (localMaisProximo) {
        setMaisProxima(localMaisProximo);
        setDistancia(menorDistancia);
        setUserLocation(coords);

        // Lógica de Banco de Dados
        const dataToSave = {
          usafaName: localMaisProximo.nome,
          cep: cepParaSalvar // Salva o CEP ou "GPS" se foi via localização
        };

        if (savedLocation?.id) {
          const updated = await updateSavedLocation(savedLocation.id, dataToSave);
          setSavedLocation(updated);
        } else {
          const created = await createSavedLocation(dataToSave, publicId);
          setSavedLocation(created);
        }
      } else {
        throw new Error('Nenhuma USAFA encontrada próxima.');
      }
  };

  const handleBuscarPorCep = async (cep: string, publicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) throw new Error('CEP inválido.');

      const coords = await getCoordinatesFromCep(cepLimpo);
      await calcularProximaESalvar(coords, cepLimpo, publicId);
      
    } catch (err: unknown ) {
      setError( err instanceof Error ? err.message : 'Erro ao buscar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscarPorGPS = async (publicId: string) => {
    setIsLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('GPS não suportado.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          // Passamos "GPS-AUTO" como "cep" só para registrar no banco que foi via GPS
          await calcularProximaESalvar(coords, "GPS-AUTO", publicId);
          setIsLoading(false); // Importante fechar o loading aqui
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      },
      (err) => {
        setError(`Permissão de localização negada: ${err.message}`);
        setIsLoading(false);
      }
    );
  };

  // Carrega dados iniciais
  const loadSavedLocation = useCallback(async (publicId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSavedLocation(publicId);
      setSavedLocation(data); // Salva o que veio do banco (pode ser null)
    } catch (err) {
      // Não tratamos 404 como erro, apenas erro de conexão
      setError("Falha ao carregar dados salvos." + (err instanceof Error ? err.message : ''));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    maisProxima,
    userLocation,
    distancia,
    isLoading,
    error,
    savedLocation,
    loadSavedLocation,
    handleBuscarPorCep,
    handleBuscarPorGPS // Nova função exportada
  };
};