import React from 'react';
import style from './UsafaMap.module.scss'; // SCSS Module
import { GeoLocation, Usafa } from '../../types/maps.type';

interface UsafaMapProps {
  usafa: Usafa;
  userLocation: GeoLocation;
}

export const UsafaMap: React.FC<UsafaMapProps> = ({ usafa, userLocation }) => {
  // Correção da URL: Usando o padrão Universal do Google Maps DIR
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${usafa.lat},${usafa.lng}&travelmode=driving`;

  return (
    <div className={style.mapContainer}>
      <h3>Rota sugerida:</h3>
      
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={style.routeLink} // Classe que faz o estilo do botão tracejado
      >
        <div className={style.linkContent}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A1 1 0 0021 7.618l-4.553-2.276M15 7v13M9 7l6-3M9 7L3.553 4.276" />
          </svg>

          <span className={style.mainText}>
            Clique aqui para abrir a rota no Google Maps
          </span>
          <span className={style.subText}>
            Ver trajeto de carro/apé
          </span>
        </div>
      </a>
    </div>
  );
};