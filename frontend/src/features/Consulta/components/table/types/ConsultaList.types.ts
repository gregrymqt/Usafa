import type { Consulta } from "../../../types/consulta.types";

export interface ConsultaListProps {
  consultas: Consulta[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}