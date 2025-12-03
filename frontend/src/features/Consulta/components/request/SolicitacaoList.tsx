import React, { useMemo } from "react";
import styles from "./SolicitacaoList.module.scss";
import Table from "../../../../components/Tables/Tables";
import { ColumnType } from "../../../../components/Tables/types";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";
import { ConsultaSummary } from "../../types/consulta.types";

interface SolicitacaoListProps {
  solicitacoes: ConsultaSummary[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

// Componente para renderizar Status com estilo
const StatusBadge = ({ status }: { status: string }) => {
  // Mapeia classes CSS baseadas no status (PENDENTE, RECUSADA, ACEITA)
  const statusClass =
    styles[
      `status${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`
    ];
  return <span className={`${styles.badge} ${statusClass}`}>{status}</span>;
};

export const SolicitacaoList: React.FC<SolicitacaoListProps> = ({
  solicitacoes,
  isLoading,
  hasMore,
  loadMore,
}) => {
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoading);

  // Definição das colunas
  const colunas: ColumnType<ConsultaSummary>[] = useMemo<
    ColumnType<ConsultaSummary>[]
  >(
    () => [
      {
        header: "Especialidade",
        accessor: "especialidade" as keyof ConsultaSummary,
      }, // Adapte ao nome do campo no DTO
      { header: "Médico", accessor: "medico" as keyof ConsultaSummary },
      { header: "Data Solicitada", accessor: "dia" }, // Formatar data se necessário no Table ou aqui
      {
        header: "Status",
        accessor: "status",
        render: (row: ConsultaSummary) => <StatusBadge status={row.status} />, // Renderização customizada
      },
    ],
    []
  );

  const renderContent = () => {
    if (isLoading && solicitacoes.length === 0) {
      return <div className={styles.loading}>Carregando solicitações...</div>;
    }
    if (solicitacoes.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>Nenhuma solicitação pendente encontrada.</p>
        </div>
      );
    }
    return <Table colunas={colunas} dados={solicitacoes} />;
  };

  return (
    <section className={styles.listSection}>
      {renderContent()}

      {/* Sentinela para Infinite Scroll */}
      <div ref={lastElementRef} style={{ height: "1px" }} />

      {isLoading && solicitacoes.length > 0 && (
        <div className={styles.loadingMore}>Carregando mais...</div>
      )}
    </section>
  );
};
