import React from 'react';
import type { GeoLocation, Usafa } from '../../types/maps.type';
import style from './UsafaDisplayCard.module.scss'; // SCSS Module
import { UsafaMap } from '../Map/UsafaMap';

interface UsafaDisplayCardProps {
  usafa: Usafa;
  userLocation?: GeoLocation | null; 
  distancia?: number;
  title?: string;
}

export const UsafaDisplayCard: React.FC<UsafaDisplayCardProps> = ({
  usafa,
  userLocation,
  distancia,
  title
}) => {
  return (
    <div className={style.cardWrapper}>
      {/* Cabeçalho do Card */}
      <div className={style.cardHeader}>
        <h3>
          {title || "Unidade de Saúde Encontrada"}
        </h3>
      </div>

      {/* Corpo do Card */}
      <div className={style.cardBody}>
        
        <div className={style.usafaInfo}>
            <h4>{usafa.nome}</h4>
            <p>{usafa.endereco}</p>
        </div>

        {distancia !== undefined && (
          <div className={style.distanceBadge}>
            <span>📍 Aprox. {distancia.toFixed(2)} km de você</span>
          </div>
        )}

        <hr className={style.divider} />

        {/* Renderiza o mapa apenas se tivermos a localização do usuário */}
        {userLocation ? (
          <UsafaMap usafa={usafa} userLocation={userLocation} />
        ) : (
          <p className={style.warningLocation}>
            Precisamos da sua localização para traçar a rota.
          </p>
        )}
      </div>
    </div>
  );
};