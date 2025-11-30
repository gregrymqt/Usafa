import React, { useState } from 'react';
 
import style from './UsafaFinder.module.scss'; // SCSS Module
import { useAuth } from '../../../../features/Auth/hooks/useAuth';
import { useBuscaUsafa } from '../../hooks/useBuscaUsafa';
import { UsafaDisplayCard } from '../DisplayCard/UsafaDisplayCard';

export const UsafaFinder: React.FC = () => {
  const { user } = useAuth();
  const {
    handleBuscarPorCep,
    handleBuscarPorGPS,
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
    <div className={style.finderContainer}>
      <div className={style.header}>
        <h2>Encontre sua USAFA</h2>
        <p>Use seu CEP ou Localização Atual</p>
      </div>

      <form onSubmit={onSearchCep} className={style.searchForm}>
        {/* Linha do Input + Botão Buscar */}
        <div className={style.inputRow}>
            <input
              type="text"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="Digite o CEP (ex: 11700-000)"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !cep}
              className={style.btnPrimary} // Botão Azul Padrão
            >
              Buscar
            </button>
        </div>

        {/* Divisor "OU" */}
        <div className={style.dividerOr}>
            <div className={style.line}></div>
            <span>OU</span>
            <div className={style.line}></div>
        </div>

        {/* Botão de GPS */}
        <button
            type="button"
            onClick={() => user?.publicId && handleBuscarPorGPS(user.publicId)}
            disabled={isLoading}
            className={style.btnGps} // Botão Verde Específico
        >
            📍 Usar minha localização atual (GPS)
        </button>
      </form>

      {/* Exibição de Erros */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-center text-sm">
          {/* Pode criar uma classe .errorBox no SCSS se quiser remover esse inline do tailwind que sobrou, 
              ou reutilizar style.alertBox do loader se importar styles globais */}
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className={style.loadingText}>
          Calculando a unidade mais próxima...
        </div>
      )}

      {/* Resultado */}
      {maisProxima && userLocation && !isLoading && (
        <div style={{ marginTop: '2rem' }}>
          <UsafaDisplayCard
              title="Unidade Recomendada"
              usafa={maisProxima}
              userLocation={userLocation}
              distancia={distancia}
          />
        </div>
      )}
    </div>
  );
};