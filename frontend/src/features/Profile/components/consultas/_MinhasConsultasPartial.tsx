import React, { useEffect, useState, useMemo, useCallback } from 'react';
// Ajuste o caminho
import styles from './_MinhasConsultasPartial.module.scss';
import { Consulta } from '../../types/profile.type';
import { ColumnType } from '../../../../components/Tables/types';
import { getConsultas } from '../../../Consulta/services/consulta.service';
import Table from '../../../../components/Tables/Tables';

// Interface para tipar a resposta paginada do backend (Spring Page)
interface Page<T> {
  content: T[];
  totalPages: number;
}

// Tipagem para os dados da tabela (pode incluir ReactNode no status)
interface ConsultaTableData extends Omit<Consulta, 'status'> {
  status: React.ReactNode;
}

interface Props {
  userId: string;
}

export const MinhasConsultasPartial: React.FC<Props> = ({ userId }) => {
  const [data, setData] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação
  const [page, setPage] = useState(0);
  const pageSize = 5; // Quantidade por página
  const [totalPages, setTotalPages] = useState(0);
  
  const fetchConsultas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Chama a API fornecida no contexto
      const response = await getConsultas(userId, {
        page: page, 
        size: pageSize, 
        search: '' // Pode adicionar um input de busca no futuro
      }) as unknown as Page<Consulta>; // Tipa a resposta
      
      // Ajustando conforme retorno provável de Page<Consulta> do Spring/Backend
      // Assumindo que response.content tem a lista e response.totalPages o total
      // Se o retorno for diferente, ajuste aqui.
      setData(response.content || []);
      setTotalPages(response.totalPages || 1);
      
    } catch (err) {
      console.error("Erro ao buscar consultas:", err); // Utiliza a variável de erro
      setError('Não foi possível carregar seu histórico de consultas.');
    } finally {
      setLoading(false);
    }
  }, [userId, page, pageSize]);

  useEffect(() => {
    if (userId) {
      fetchConsultas();
    }
  }, [userId, page, fetchConsultas]); // Adiciona fetchConsultas na dependência

  // Transformação dos dados para UX (Adicionando Badges coloridos)
  const tableData: ConsultaTableData[] = useMemo(() => {
    return data.map((item) => ({
      ...item,
      status: (
        // Adiciona verificação para status nulo/undefined
        <span className={`${styles.statusBadge} ${styles[item.status ? item.status.toLowerCase() : 'desconhecido']}`}>
          {item.status || 'N/A'}
        </span>
      )
    }));
  }, [data]);

  // Definição das colunas
  const columns: ColumnType<ConsultaTableData>[] = [
    { header: 'Data', accessor: 'data' }, // Corrigido: 'data' em vez de 'dia'
    { header: 'Horário', accessor: 'horario' },
    { header: 'Médico', accessor: 'medico' },
    { header: 'Especialidade', accessor: 'especialidade' }, // Corrigido: 'especialidade' em vez de 'tipo'
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <div className={styles.container}>
      <header>
        <h2>Histórico de Consultas</h2>
      </header>

      {error && <div className={styles.errorState}>{error}</div>}

      {loading ? (
        <div className={styles.emptyState}>Carregando suas consultas...</div>
      ) : tableData.length === 0 && !error ? (
        <div className={styles.emptyState}>Nenhuma consulta encontrada.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <Table<ConsultaTableData> 
              colunas={columns} 
              dados={tableData} 
            />
          </div>

          {/* Controles de Paginação UI */}
          <div className={styles.paginationControls}>
            <button 
              onClick={() => setPage((p) => Math.max(0, p - 1))} 
              disabled={page === 0}
            >
              Anterior
            </button>
            <span>Página {page + 1} de {totalPages}</span>
            <button 
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} 
              disabled={page >= totalPages - 1}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
};