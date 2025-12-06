import React from 'react';
import styles from './ConsultaList.module.scss';
import Table from '../../../../components/Tables/Tables';
import type { ColumnType } from '../../../../components/Tables/types';
import { useInfiniteScroll } from '../../../../shared/utils/forPages.utils';
import { AppointmentUserResponse } from '../../types/consulta.types';

export interface ConsultaListProps {
  consultas: AppointmentUserResponse[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

// Colunas mapeadas para AppointmentUserResponse
const colunas: ColumnType<AppointmentUserResponse>[] = [
  { header: 'Médico', accessor: 'medicoNome' },
  { header: 'Tipo', accessor: 'especialidade' },
  { header: 'Data', accessor: 'data' },
  { header: 'Horário', accessor: 'horario' },
  { header: 'Status', accessor: 'status' },
];

export const ConsultaList: React.FC<ConsultaListProps> = ({
  consultas,
  isLoading,
  hasMore,
  loadMore,
}) => {
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore, isLoading);

  const renderContent = () => {
    if (isLoading && consultas?.length === 0) {
      return <div className={styles.loading}>Carregando histórico...</div>;
    }

    if (consultas?.length === 0) {
      return <p className={styles.empty}>Você ainda não possui consultas.</p>;
    }

    return <Table colunas={colunas} dados={consultas} />;
  };

  return (
    <section className={styles.consultaListSection}>
      <h2>Seu Histórico de Consultas</h2>
      {renderContent()}
      
      {/* CORREÇÃO: O sentinela só aparece se tiver itens E tiver mais páginas */}
      {consultas.length > 0 && hasMore && (
         <div ref={lastElementRef} className={styles.infiniteScrollSentinel} />
      )}

      {isLoading && consultas.length > 0 && (
        <div className={styles.loading}>Carregando mais...</div>
      )}
    </section>
  );
};