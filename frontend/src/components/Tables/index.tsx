import React from 'react';
import './Table.scss';
import { type ColumnType, type TableDataType } from './types/index';

/**
 * Componente de Tabela Reutilizável
 * @template T - O tipo dos objetos de dados na tabela.
 * @param {Object} props - As propriedades do componente.
 * @param {ColumnType<T>[]} props.colunas - Array de objetos para definir as colunas.
 * @param {TableDataType<T>} props.dados - Array de objetos com os dados para as linhas.
 */
const Table = <T extends object>({ colunas = [], dados = [] }: { colunas: ColumnType<T>[]; dados: TableDataType<T> }) => {
  if (!colunas || colunas.length === 0 || !dados || dados.length === 0) {
    return <p>Dados da tabela não fornecidos.</p>;
  }

  return (
    <div className="table-container">
      <table className="reusable-table">
        <thead>
          <tr>
            {colunas.map((coluna, index) => (
              <th key={index}>{coluna.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, indexLinha) => (
            <tr key={indexLinha}>
              {colunas.map((coluna, indexColuna) => (
                <td key={indexColuna} data-label={coluna.header}>
                  {linha[coluna.accessor] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
