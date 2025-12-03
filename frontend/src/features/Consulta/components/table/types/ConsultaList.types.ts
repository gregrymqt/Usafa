import type { ConsultaSummary } from "../../../types/consulta.types";

export interface ConsultaListProps {
  consultas: ConsultaSummary[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}