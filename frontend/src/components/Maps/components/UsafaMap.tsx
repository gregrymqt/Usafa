import React from 'react';
import type { GeoLocation, Usafa } from '../types/maps.type';

interface UsafaMapProps {
  usafa: Usafa;
  userLocation: GeoLocation;
}

export const UsafaMap: React.FC<UsafaMapProps> = ({ usafa, userLocation }) => {
  // CORREÇÃO: URL oficial do Google Maps para Navegação (Driving Mode)
  // O erro anterior era usar 'googleusercontent'. O certo é 'google.com/maps/dir'
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${usafa.lat},${usafa.lng}&travelmode=driving`;

  return (
    <div className="mt-4 w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
        Rota sugerida:
      </h3>
      
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-xl p-4 transition-all group text-center no-underline"
      >
        <div className="flex flex-col items-center justify-center">
          {/* O ÍCONE GIGANTE FOI CONSERTADO AQUI (w-10 h-10) */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A1 1 0 0021 7.618l-4.553-2.276M15 7v13M9 7l6-3M9 7L3.553 4.276" />
          </svg>

          <span className="text-blue-800 font-bold text-sm block">
            Clique aqui para abrir a rota no Google Maps
          </span>
          <span className="text-blue-600 text-xs mt-1 block">
            Ver trajeto de carro/apé
          </span>
        </div>
      </a>
    </div>
  );
};