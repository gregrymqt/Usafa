import type { SolicitacaoSummary } from "../../../types/consulta.types";

export interface ConsultaListProps {
  consultas: SolicitacaoSummary[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}