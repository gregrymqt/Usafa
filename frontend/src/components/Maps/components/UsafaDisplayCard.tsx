import React from 'react';
import { type GeoLocation, type Usafa } from '../types'; // Importe seus tipos
import { UsafaMap } from './UsafaMap'; // O componente de mapa que você já tem

interface UsafaDisplayCardProps {
  /** A Usafa para exibir */
  usafa: Usafa;
  /** A localização do usuário para o mapa */
  userLocation?: GeoLocation;
  /** A distância opcional para exibir */
  distancia?: number;
  /** Título do card, ex: "Sua USAFA Salva" ou "Resultado da Busca" */
  title: string;
}

export const UsafaDisplayCard: React.FC<UsafaDisplayCardProps> = ({
  usafa,
  userLocation,
  distancia,
  title
}) => {
  return (
    <div className="p-4 bg-green-50 border border-green-300 rounded-md shadow-lg">
      <h3 className="text-xl font-bold text-green-800">{title}</h3>
      <p className="text-lg text-gray-700 mt-2">
        <strong>{usafa.nome}</strong>
      </p>
      <p className="text-md text-gray-600">{usafa.endereco}</p>
      
      {distancia !== undefined && (
        <p className="text-md text-gray-600">
          Aproximadamente <strong>{distancia.toFixed(2)} km</strong> de distância.
        </p>
      )}

      {userLocation && (
        <UsafaMap usafa={usafa} userLocation={userLocation} />
      )}
    </div>
  );
};

// ===============================================================
// COLOQUE SEU UsafaMap NO MESMO ARQUIVO OU IMPORTE DE OUTRO
// (Eu apenas copiei o seu código de 'logError.md' aqui)
// ===============================================================

interface UsafaMapProps {
  usafa: Usafa;
  userLocation: GeoLocation;
}

export const UsafaMap: React.FC<UsafaMapProps> = ({ usafa, userLocation }) => {
  // Corrigindo sua URL do Google Maps
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${usafa.lat},${usafa.lng}&travelmode=driving`;

  return (
    <div className="mt-4">
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-64 bg-gray-300 rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg relative group"
        aria-label={`Abrir rota no Google Maps para ${usafa.nome}`}
      >
        <div className="absolute inset-0 bg-blue-100 border-4 border-blue-300 flex items-center justify-center">
          <div className="text-center p-4">
            {/* ... seu SVG de ícone de mapa ... */}
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-blue-600 h-12 w-12"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            <p className="mt-2 font-semibold text-blue-800">Clique para abrir a rota</p>
            <p className="text-sm text-blue-600">para {usafa.nome}</p>
          </div>
        </div>
      </a>
    </div>
  );
};