// components/UsafaDisplayCard.tsx
import React from 'react';
import { UsafaMap } from './UsafaMap';
import type { GeoLocation, Usafa } from '../types/maps.type';

interface UsafaDisplayCardProps {
  usafa: Usafa;
  userLocation?: GeoLocation | null; 
  distancia?: number;
  title?: string; // Título agora é opcional
}

export const UsafaDisplayCard: React.FC<UsafaDisplayCardProps> = ({
  usafa,
  userLocation,
  distancia,
  title
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Cabeçalho do Card */}
      <div className="bg-blue-900 p-4 text-center">
        <h3 className="text-white font-bold text-lg">
          {title || "Unidade de Saúde Encontrada"}
        </h3>
      </div>

      {/* Corpo do Card */}
      <div className="p-6 flex flex-col items-center text-center">
        
        <div className="mb-4">
            <h4 className="text-xl font-bold text-gray-800 mb-1">{usafa.nome}</h4>
            <p className="text-gray-600 text-sm px-4">{usafa.endereco}</p>
        </div>

        {distancia !== undefined && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
            <span>📍 Aprox. {distancia.toFixed(2)} km de você</span>
          </div>
        )}

        <hr className="w-full border-gray-200 mb-4" />

        {/* Renderiza o mapa apenas se tivermos a localização do usuário */}
        {userLocation ? (
          <div className="w-full">
            <UsafaMap usafa={usafa} userLocation={userLocation} />
          </div>
        ) : (
          <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
            Precisamos da sua localização para traçar a rota.
          </p>
        )}
      </div>
    </div>
  );
};