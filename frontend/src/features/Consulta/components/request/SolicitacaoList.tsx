import React, { useMemo } from "react";
import styles from "./SolicitacaoList.module.scss";
import Table from "../../../../components/Tables/Tables";
import { ColumnType } from "../../../../components/Tables/types";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";
import { AppointmentUserResponse } from "../../types/consulta.types";

interface SolicitacaoListProps {
  solicitacoes: AppointmentUserResponse[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusClass = styles[`status${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`] || styles.statusDefault;
  return <span className={`${styles.badge} ${statusClass}`}>{status}</span>;
};

export const SolicitacaoList: React.FC<SolicitacaoListProps> = ({
  solicitacoes,
  isLoading,
  hasMore,
  loadMore,
}) => {
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoading);

  // Colunas mapeadas para AppointmentUserResponse
  const colunas: ColumnType<AppointmentUserResponse>[] = useMemo(
    () => [
      { header: "Especialidade", accessor: "especialidade" }, 
      { header: "Médico", accessor: "medicoNome" },
      { header: "Data Solicitada", accessor: "data" }, 
      {
        header: "Status",
        accessor: "status",
        render: (row: AppointmentUserResponse) => <StatusBadge status={row.status} />,
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
      <div ref={lastElementRef} style={{ height: "1px" }} />
      {isLoading && solicitacoes.length > 0 && (
        <div className={styles.loadingMore}>Carregando mais...</div>
      )}
    </section>
  );
};