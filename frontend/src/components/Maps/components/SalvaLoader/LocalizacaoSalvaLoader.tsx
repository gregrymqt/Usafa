import React, { useEffect } from 'react';
import { useBuscaUsafa } from '../../hooks/useBuscaUsafa';
import { UsafaDisplayCard } from '../DisplayCard/UsafaDisplayCard';
import { USAFAS } from '../../data/usafaData'; 
import { useAuth } from '../../../../features/Auth/hooks/useAuth';
import style from './LocalizacaoSalvaLoader.module.scss'; // Importando o SCSS Module

const LoadingSpinner = () => (
  <div className={style.loaderContainer}>
    {/* SVG de Loading */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span style={{ marginLeft: '10px' }}>Carregando dados salvos...</span>
  </div>
);

export const LocalizacaoSalvaLoader: React.FC = () => {
  const { user } = useAuth();
  const {
    savedLocation,
    isLoading,
    error,
    loadSavedLocation
  } = useBuscaUsafa();

  useEffect(() => {
    if (user?.publicId) {
      loadSavedLocation(user.publicId);
    }
  }, [user, loadSavedLocation]);

  const usafaSalva = savedLocation
    ? USAFAS.find(u => u.nome === savedLocation.usafaName)
    : null;

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
     return (
       // Usando classe semântica de erro
       <div className={`${style.alertBox} ${style.error}`} role="alert">
         <strong>Erro ao carregar dados:</strong> {error}
       </div>
     );
  }

  if (usafaSalva) {
    return (
      <UsafaDisplayCard
        title="Sua USAFA Salva"
        usafa={usafaSalva}
      />
    );
  }

  return (
    // Usando classe semântica de info
    <div className={`${style.alertBox} ${style.info}`}>
      Você ainda não salvou uma localização. Use a busca abaixo para encontrar.
    </div>
  );
};