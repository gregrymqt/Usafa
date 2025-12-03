import React, { useEffect, useState, useMemo, useCallback } from 'react';
// Ajuste o caminho
import styles from './_MinhasConsultasPartial.module.scss';
import { Consulta } from '../../types/profile.type';
import { consultaService } from '../../../Consulta/services/consulta.service';
import Table from '../../../../components/Tables/Tables';

// Interface para tipar a resposta paginada do backend (Spring Page)
interface Page<T> {
  content: T[];
  totalPages: number;
}

interface Props {
  userId: string;
}

interface ConsultaRow {
  id: string; // ou number, dependendo do seu back
  data: string;
  horario: string;
  medico: string;
  especialidade: string;
  status: React.ReactNode; // Para o elemento JSX <span>
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
      const response = await consultaService.getConsultasConfirmadas(userId, {
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

  const tableData = useMemo<ConsultaRow[]>(() => {
    return data.map((item) => {
        // Lógica para separar Data e Hora se o back mandar ISO String
        const dataObj = new Date(item.data || ''); 
        
        return {
            id: item.id, // Importante para keys
            // Se o back já manda separado, use item.data. Se manda junto, formate:
            data: item.data || dataObj.toLocaleDateString('pt-BR'), 
            horario: item.horario || dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            
            medico: item.medico, // Garante que pegue o nome
            especialidade: item.especialidade  || 'Geral', // Fallback
            
            status: (
                <span className={`${styles.statusBadge} ${styles[item.status?.toLowerCase() || 'pendente']}`}>
                {item.status || 'Pendente'}
                </span>
            )
        } as ConsultaRow;
    });
  }, [data]);

  // Colunas alinhadas com o objeto retornado no tableData acima
  const columns = [
    { header: 'Data', accessor: 'data' as const },           // <--- Adicione 'as const'
    { header: 'Horário', accessor: 'horario' as const },     // <--- Adicione 'as const'
    { header: 'Médico', accessor: 'medico' as const },       // <--- Adicione 'as const'
    { header: 'Especialidade', accessor: 'especialidade' as const },
    { header: 'Status', accessor: 'status' as const },
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
            <Table 
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