import React, { useState, useMemo } from 'react';
import styles from './HomeList.module.scss';
import { ActionMenu } from '../../../../../../components/ActionMenu/ActionMenu';
import Table from '../../../../../../components/Tables/Tables';
import { ColumnType } from '../../../../../../components/Tables/types';
import { HomeContent, ContentType, CONTENT_TYPES } from '../../types/homeAdmin.type';

interface HomeListProps {
  data: HomeContent[];
  onEdit: (item: HomeContent) => void;
  onDelete: (id: number | string) => void;
}

const HomeList: React.FC<HomeListProps> = ({ data, onEdit, onDelete }) => {
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');

  // Filtra os dados localmente
  const filteredData = useMemo(() => {
    if (filterType === 'all') return data;
    return data.filter(item => item.type === filterType);
  }, [data, filterType]);

  // Prepara os dados para o formato que a Table aceita
  // Adicionando a coluna de 'ações' como um ReactNode
  const tableData = filteredData.map(item => ({
    ...item,
    thumb: item.imageUrl ? <img src={item.imageUrl} alt="" className={styles.thumbImage} /> : '-',
    actions: (
      <ActionMenu 
        onUpdate={() => onEdit(item)} 
        onDelete={() => onDelete(item.id)} 
      />
    )
  }));

  // Definição das colunas
  const columns: ColumnType<typeof tableData[0]>[] = [
    { header: 'Imagem', accessor: 'thumb' as keyof typeof tableData[0] }, // Cast pois accessor espera chave, mas estamos injetando node
    { header: 'Título', accessor: 'title' },
    { header: 'Tipo', accessor: 'type' },
    { header: 'Descrição', accessor: 'description' },
    { header: 'Ações', accessor: 'actions' as keyof typeof tableData[0] }
  ];

  return (
    <div className={styles.listContainer}>
      <div className={styles.header}>
        <h2>Gerenciar Conteúdo</h2>
        <select 
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
        >
          <option value="all">Todos</option>
          {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <Table colunas={columns} dados={tableData} />
    </div>
  );
};
export default HomeList;