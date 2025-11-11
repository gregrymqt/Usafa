import React, { useState } from 'react';
import { useBuscaUsafa } from '../hooks/useBuscaUsafa';
import { useAuth } from '../hooks/useAuth'; // (Supondo que você tenha um hook de auth)
import { UsafaDisplayCard } from './UsafaDisplayCard';

// Componente "Loading" que você tinha
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg className="animate-spin h-8 w-8 text-blue-600" /* ... */ >
      {/* ... seu SVG de loading ... */}
    </svg>
    <span className="ml-3 text-gray-700">Buscando...</span>
  </div>
);

export const UsafaFinder: React.FC = () => {
  const { user } = useAuth(); // Pega o usuário
  const {
    handleBuscar, // Função de POST/PUT
    isLoading,
    error,
    maisProxima,
    userLocation,
    distancia
  } = useBuscaUsafa();
  
  const [cep, setCep] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (user?.publicId && cep) {
      // Chama o método POST/PUT do hook
      handleBuscar(cep, user.publicId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
        Encontre e Salve sua USAFA
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Digite seu CEP (ex: 01001-000)"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? "Buscando..." : "Buscar e Salvar"}
        </button>
      </form>

      <div className="mt-6 min-h-[100px]">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md" role="alert">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {isLoading && <LoadingSpinner />}

        {maisProxima && userLocation && (
          // Usa o componente genérico para exibir o RESULTADO DA BUSCA
          <UsafaDisplayCard
            title="USAFA mais próxima encontrada!"
            usafa={maisProxima}
            userLocation={userLocation}
            distancia={distancia}
          />
        )}
      </div>
    </div>
  );
};