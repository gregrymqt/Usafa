import React, { useState, useMemo } from 'react';
import styles from './HomeList.module.scss';
import { ActionMenu } from '../../../../../../components/ActionMenu/ActionMenu';
import Table from '../../../../../../components/Tables/Tables';
import { ColumnType } from '../../../../../../components/Tables/types';
import { HomeContent, ContentType, CONTENT_TYPES } from '../../types/homeAdmin.type';
// Importe o helper que criamos
import { getImageUrl } from '../../../../../../shared/utils/image.utils'; 

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
  const tableData = filteredData.map(item => {
    // 1. Resolve a URL usando o helper
    const finalImageUrl = getImageUrl(item.imageUrl);

    return {
      ...item,
      // 2. Renderiza a imagem com tratamento de erro
      thumb: finalImageUrl ? (
        <img 
          src={finalImageUrl} 
          alt={item.title} 
          className={styles.thumbImage} 
          onError={(e) => {
            // Se der erro (404), esconde a imagem ou mostra um placeholder
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className={styles.noImage}>-</span>
      ),
      actions: (
        <ActionMenu 
          onUpdate={() => onEdit(item)} 
          onDelete={() => onDelete(item.id)} 
        />
      )
    };
  });

  // Definição das colunas
  const columns: ColumnType<typeof tableData[0]>[] = [
    { header: 'Imagem', accessor: 'thumb' as keyof typeof tableData[0] }, 
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