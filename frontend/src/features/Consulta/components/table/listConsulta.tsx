import React from 'react';
import styles from './ConsultaList.module.scss'; // SCSS Módulo
import Table from '../../../../components/Tables';
import type { ColumnType } from '../../../../components/Tables/types';
import type { Consulta } from '../../types/consulta.types';

interface ConsultaListProps {
  consultas: Consulta[];
  isLoading: boolean;
}

// Define as colunas para o seu componente de Tabela
const colunas: ColumnType<Consulta>[] = [
  { header: 'Médico', accessor: 'medico' },
  { header: 'Tipo', accessor: 'tipo' },
  { header: 'Data', accessor: 'dia' },
  { header: 'Horário', accessor: 'horario' },
  { header: 'Status', accessor: 'status' },
];

export const ConsultaList: React.FC<ConsultaListProps> = ({ consultas, isLoading }) => {
  
  const renderContent = () => {
    if (isLoading) {
      return <div className={styles.loading}>Carregando histórico...</div>;
    }
    
    if (consultas.length === 0) {
      return <p className={styles.empty}>Você ainda não possui consultas.</p>;
    }
    
    // Usa seu componente de Tabela reutilizável
    return <Table colunas={colunas} dados={consultas} />;
  };

  return (
    <section className={styles.consultaListSection}>
      <h2>Seu Histórico de Consultas</h2>
      {renderContent()}
    </section>
  );
};