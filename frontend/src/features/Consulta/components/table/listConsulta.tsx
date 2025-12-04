import React from 'react';
import styles from './ConsultaList.module.scss'; // SCSS Módulo
import Table from '../../../../components/Tables/Tables';
import type { ColumnType } from '../../../../components/Tables/types';
import type { ConsultaListProps } from './types/ConsultaList.types';
import { useInfiniteScroll } from '../../../../shared/utils/forPages.utils';
import { SolicitacaoSummary } from '../../types/consulta.types';

// Define as colunas para o seu componente de Tabela
const colunas: ColumnType<SolicitacaoSummary>[] = [
  { header: 'Médico', accessor: 'doctorName' },
  { header: 'Tipo', accessor: 'appointmentTypeName' },
  { header: 'Data', accessor: 'dia' },
  { header: 'Horário', accessor: 'horario' },
  { header: 'Status', accessor: 'status' },
];

export const ConsultaList: React.FC<ConsultaListProps> = ({
  consultas,
  isLoading,
  hasMore,
  loadMore,
}) => {
  // Hook para o scroll infinito
  const { lastElementRef } = useInfiniteScroll(
    loadMore, // Função para carregar mais itens
    hasMore,  // Flag que indica se há mais itens
    isLoading // Flag para evitar chamadas duplicadas
  );

  const renderContent = () => {
    // Mostra o loading inicial apenas se a lista estiver vazia
    if (isLoading && consultas?.length === 0) {
      return <div className={styles.loading}>Carregando histórico...</div>;
    }

    if (consultas?.length === 0) {
      return <p className={styles.empty}>Você ainda não possui consultas.</p>;
    }

    // Usa seu componente de Tabela reutilizável
    return <Table colunas={colunas} dados={consultas} />;
  };

  return (
    <section className={styles.consultaListSection}>
      <h2>Seu Histórico de Consultas</h2>
      {renderContent()}

      {/* Elemento sentinela para o scroll infinito */}
      {/* Esta div invisível ficará no final. Quando ela entrar na tela, o `lastElementRef` chamará o `loadMore`. */}
      <div ref={lastElementRef} className={styles.infiniteScrollSentinel} />

      {/* Indicador de carregamento para as páginas seguintes */}
      {isLoading && consultas.length > 0 && (
        <div className={styles.loading}>Carregando mais...</div>
      )}
    </section>
  );
};