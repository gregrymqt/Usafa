import React from 'react';
// 1. Importa o NOVO hook (que apenas calcula)
import { useUsafaCalculator } from '../../hooks/useUsafaCalculator'; 
import styles from './BuscaUsafa.module.scss'; // Importa o novo arquivo SCSS
// 2. Importa o seu componente de mapa
import { UsafaMap } from '../../../../components/Maps/components/UsafaMap'; // (Ajuste o caminho)

interface BuscaUsafaProps {
  cep: string;
}

// Renomeei de 'BuscaUsafaWidget' para 'BuscaUsafa' para bater com seu 'index.tsx'
export const BuscaUsafa: React.FC<BuscaUsafaProps> = ({ cep }) => {
  
  // 3. Usa o novo hook e passa o CEP
  // A lógica de "buscar" agora acontece automaticamente dentro do hook
  const {
    isLoading,
    error,
    maisProxima,
    userLocation,
    distancia,
  } = useUsafaCalculator(cep); // Passa o CEP direto para o hook

  // 4. Removemos o 'useEffect' que chamava 'handleBuscar'
  // A lógica agora é mais limpa e só de exibição.

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        Buscando USAFA mais próxima...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <strong>Erro:</strong> {error}
      </div>
    );
  }

  if (maisProxima && userLocation) {
    return (
      <div className={styles.successState}>
        <h3>USAFA de Referência</h3>
        <p className={styles.usafaName}>
          <strong>{maisProxima.nome}</strong>
        </p>
        <p>{maisProxima.endereco}</p>
        <p>
          Aproximadamente <strong>{distancia.toFixed(2)} km</strong> de distância. 
        </p>
        
        <UsafaMap 
          usafa={maisProxima} 
          userLocation={userLocation} 
        />
      </div>
    );
  }

  return (
    <div className={styles.defaultState}>
      CEP não encontrado ou inválido.
    </div>
  );
};