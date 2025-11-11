import React, { useEffect } from 'react';
import { useBuscaUsafa } from '../hooks/useBuscaUsafa';
import { useAuth } from '../hooks/useAuth'; // (Supondo que você tenha um hook de auth)
import { UsafaDisplayCard } from './UsafaDisplayCard';
import { USAFAS } from '../data/usafaData'; // Importa sua lista de Usafas

// Componente "Loading" que você tinha
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg className="animate-spin h-8 w-8 text-blue-600" /* ... */ >
      {/* ... seu SVG de loading ... */}
    </svg>
    <span className="ml-3 text-gray-700">Carregando dados salvos...</span>
  </div>
);

export const LocalizacaoSalvaLoader: React.FC = () => {
  const { user } = useAuth(); // Pega o usuário (ex: { publicId: "user-123" })
  const {
    savedLocation,
    isLoading,
    error,
    loadSavedLocation
  } = useBuscaUsafa();

  // (GET) Roda 1 vez para buscar os dados salvos do usuário
  useEffect(() => {
    if (user?.publicId) {
      // Chama o método GET do hook
      loadSavedLocation(user.publicId);
    }
  }, [user, loadSavedLocation]);

  // Encontra os dados completos da USAFA salva
  const usafaSalva = savedLocation
    ? USAFAS.find(u => u.nome === savedLocation.usafaName)
    : null;

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
     return (
       <div className="p-4 bg-red-100 text-red-700 rounded-md" role="alert">
         <strong>Erro ao carregar dados:</strong> {error}
       </div>
     );
  }

  if (usafaSalva) {
    return (
      <UsafaDisplayCard
        title="Sua USAFA Salva"
        usafa={usafaSalva}
        // Não temos userLocation aqui, a menos que você salve lat/lng no DB
      />
    );
  }

  return (
    <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
      Você ainda não salvou uma localização. Use a busca abaixo para encontrar.
    </div>
  );
};