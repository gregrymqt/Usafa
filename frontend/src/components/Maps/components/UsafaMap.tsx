import type { GeoLocation, Usafa } from "../types";

interface UsafaMapProps {
  usafa: Usafa;
  userLocation: GeoLocation;
}

export const UsafaMap: React.FC<UsafaMapProps> = ({ usafa, userLocation }) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${usafa.lat},${usafa.lng}&travelmode=driving`;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800">Mapa para: {usafa.nome}</h3>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-64 bg-gray-300 rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg relative group"
        aria-label={`Abrir rota no Google Maps para ${usafa.nome}`}
      >
        <div className="absolute inset-0 bg-blue-100 border-4 border-blue-300 flex items-center justify-center">
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-blue-600 h-12 w-12">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="mt-2 font-semibold text-blue-800">Clique para abrir a rota</p>
            <p className="text-sm text-blue-600">para {usafa.nome}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
          <p className="text-white text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Abrir no Google Maps
          </p>
        </div>
      </a>
    </div>
  );
};