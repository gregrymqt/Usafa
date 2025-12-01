import React, { useState, useMemo } from 'react';

import { usePatientPassword } from '../../hooks/usePatientPassword';
import AuthForm from '../../../../../../components/Form/AuthForm';
import type { FormField } from '../../../../../../components/Form/types/form.type';

import styles from './PasswordTokenManager.module.scss';
import Table from '../../../../../../components/Tables/Tables';
import { ColumnType } from '../../../../../../components/Tables/types';
import { PasswordTokenResponse } from '../../types/patientPassword.type';

/**
 * Formata uma data ISO para um formato legível (dd/MM/yyyy HH:mm).
 * @param isoDate - A data em formato string ISO.
 * @returns A data formatada ou uma string vazia.
 */
const formatDisplayDate = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Data inválida';
  }
};

export const PasswordTokenManager: React.FC = () => {
  const [userPublicId, setUserPublicId] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { getPasswordToken, tokenData, isLoading, error } = usePatientPassword();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userPublicId) return;
    setSearchAttempted(true);
    await getPasswordToken(userPublicId);
  };

  const formFields: FormField[] = useMemo(
    () => [
      {
        elementType: 'input',
        type: 'text',
        name: 'userPublicId',
        label: 'ID Público do Paciente',
        placeholder: 'Cole o ID público aqui...',
        value: userPublicId,
        onChange: (val) => setUserPublicId(val as string),
        required: true,
      },
    ],
    [userPublicId]
  );

  const tableColumns: ColumnType<PasswordTokenResponse>[] = useMemo(
    () => [
      {
        header: 'URL de Criação',
        accessor: 'url',
      },
      {
        header: 'Expira em',
        accessor: 'expiryDate',
      },
    ],
    []
  );

  // Formata os dados para exibição na tabela
  const tableData = useMemo(() => {
    if (!tokenData) return [];
    return [
      {
        ...tokenData,
        expiryDate: formatDisplayDate(tokenData.expiryDate),
      },
    ];
  }, [tokenData]);

  return (
    <div className={styles.managerContainer}>
      <h2 className={styles.title}>Consultar Link de Senha</h2>
      <div className={styles.formWrapper}>
        <AuthForm
          fields={formFields}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          buttonText="Buscar Token"
        />
      </div>

      {isLoading && <p className={styles.loadingText}>Buscando...</p>}

      {error && !isLoading && (
        <p className={styles.errorText}>
          {error.includes('404') ? 'Nenhum token ativo encontrado para este ID.' : error}
        </p>
      )}

      {!isLoading && !error && tokenData && (
        <div className={styles.tableWrapper}>
          <Table<PasswordTokenResponse> colunas={tableColumns} dados={tableData} />
        </div>
      )}

      {!isLoading && !tokenData && searchAttempted && !error && (
        <p className={styles.infoText}>Nenhum resultado para exibir.</p>
      )}
    </div>
  );
};