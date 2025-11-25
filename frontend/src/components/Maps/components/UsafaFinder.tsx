// pages/UsafaFinder.tsx (ou components/UsafaFinder.tsx)
import React, { useState } from 'react';
import { useBuscaUsafa } from '../hooks/useBuscaUsafa';
import { UsafaDisplayCard } from './UsafaDisplayCard';
import { useAuth } from '../../../features/Auth/hooks/useAuth'; // Ajuste o path

export const UsafaFinder: React.FC = () => {
  const { user } = useAuth();
  const {
    handleBuscarPorCep,
    handleBuscarPorGPS, // Usando a nova função
    isLoading,
    error,
    maisProxima,
    userLocation,
    distancia
  } = useBuscaUsafa();
  
  const [cep, setCep] = useState("");

  const onSearchCep = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.publicId && cep) {
      handleBuscarPorCep(cep, user.publicId);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Encontre sua USAFA</h2>
        <p className="text-gray-500 text-sm">Use seu CEP ou Localização Atual</p>
      </div>

      <form onSubmit={onSearchCep} className="flex flex-col gap-3">
        <div className="flex gap-2">
            <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite o CEP (ex: 11700-000)"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isLoading}
            />
            <button
            type="submit"
            disabled={isLoading || !cep}
            className="px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
            Buscar
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OU</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
            type="button"
            onClick={() => user?.publicId && handleBuscarPorGPS(user.publicId)}
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 transition"
        >
            📍 Usar minha localização atual (GPS)
        </button>
      </form>

      {/* Exibição de Erros */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-center text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 text-center text-gray-500 animate-pulse">
          Calculando a unidade mais próxima...
        </div>
      )}

      {/* Resultado */}
      {maisProxima && userLocation && !isLoading && (
        <UsafaDisplayCard
            title="Unidade Recomendada"
            usafa={maisProxima}
            userLocation={userLocation}
            distancia={distancia}
        />
      )}
    </div>
  );
};