/**
 * Define a estrutura da localização (Latitude/Longitude)
 */
export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * Define a estrutura completa de uma USAFA.
 * (Movido de usafaData.ts para ser a fonte única da verdade)
 */
export interface Usafa {
  id: string; // Adicionei um ID para ser usado como 'key' no React
  nome: string;
  endereco: string;
  cep: string;
  lat: number;
  lng: number;
}


// (Seu tipo 'Usafa' de 'usafaData.ts' é para a *lista estática*)
// Este é o tipo para o que salvamos no *banco de dados*
export interface SavedLocation {
  id: number; // ID do banco de dados
  userPublicId: string;
  usafaName: string; // Nome da USAFA mais próxima
  cep: string;      // CEP que o usuário digitou
}

// Para criar ou atualizar, não precisamos do 'id' ou 'userPublicId' no corpo
export type LocationPayload = Omit<SavedLocation, 'id' | 'userPublicId'>;


export interface BrasilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: {
    type: string;
    coordinates: {
      longitude: number | string; // Às vezes APIs retornam string, é bom prevenir
      latitude: number | string;
    };
  };
}