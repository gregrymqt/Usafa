import { BuscaUsafa } from "../../features/Profile/components/BuscaUsafa";

export default function App(cepValue: string ) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
      <BuscaUsafa cep={cepValue} />
    </main>
  );
}