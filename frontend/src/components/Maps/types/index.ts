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