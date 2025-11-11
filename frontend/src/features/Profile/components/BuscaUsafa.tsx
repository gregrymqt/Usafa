import React from 'react';
// 1. Importa o NOVO hook (que apenas calcula)
import { useUsafaCalculator } from '../hooks/useUsafaCalculator'; 
// 2. Importa o seu componente de mapa
import { UsafaMap } from '../../../components/Maps/components/UsafaMap'; // (Ajuste o caminho)

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
      <div className="p-4 text-center text-gray-700">
        Buscando USAFA mais próxima...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
        <strong>Erro:</strong> {error}
      </div>
    );
  }

  if (maisProxima && userLocation) {
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded-md shadow-lg">
        <h3 className="text-xl font-bold text-green-800">USAFA de Referência</h3>
        <p className="text-lg text-gray-700 mt-2">
          <strong>{maisProxima.nome}</strong>
        </p>
        <p className="text-md text-gray-600">{maisProxima.endereco}</p>
        <p className="text-md text-gray-600">
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
    <div className="p-4 text-center text-gray-500">
      CEP não encontrado ou inválido.
    </div>
  );
};