import React, { useState } from 'react';
import styles from './PatientAdmin.module.scss';
import { showDeleteConfirm } from '../../utils/adminUtils';
import type { Patient, PatientAdminProps } from './types/patient.types';
import { ActionMenu } from '../../../../components/ActionMenu/ActionMenu';
import { useInfiniteScroll } from '../../../../shared/utils/forPages.utils';
import { validateCpf } from '../../../../shared/utils/validators.utils';

export const PatientAdmin: React.FC<PatientAdminProps> = ({
  patients = [], // <--- CORREÇÃO AQUI: Garante que nunca seja undefined
  isLoading,
  error,
  hasMore,
  onEditPatient,
  onDeletePatient,
  loadMorePatients,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleDeleteClick = async (patient: Patient) => {
    const confirmed = await showDeleteConfirm(patient.name);
    if (confirmed) {
      onDeletePatient(patient);
    }
  };

  // Hook para o scroll infinito
  const { lastElementRef } = useInfiniteScroll(
    loadMorePatients,
    hasMore,
    isLoading
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    if (searchTerm && !validateCpf(searchTerm)) {
      setSearchError('CPF inválido. Verifique o número digitado.');
      return;
    }

    onSearch(searchTerm);
  };

  const renderContent = () => {
    // Agora patients nunca será undefined, então .length não vai quebrar
    if (isLoading && patients.length === 0) {
      return <p className={styles.loading}>Carregando pacientes...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (patients.length === 0) {
      return <p className={styles.empty}>Nenhum paciente cadastrado.</p>;
    }

    return (
      <div className={styles.patientList}>
        {patients.map((patient, index) => {
          const isLastElement = patients.length === index + 1;
          return (
            <div
              key={patient.id}
              className={styles.patientCard}
              ref={isLastElement ? lastElementRef : null}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardInfo}>
                  <h3>{patient.name}</h3>
                  <p>CPF: {patient.cpf || 'Não informado'}</p>
                </div>
                <ActionMenu
                  onUpdate={() => onEditPatient(patient)}
                  onDelete={() => handleDeleteClick(patient)}
                />
              </div>

              <div className={styles.cardBody}>
                <p>
                  <strong>Email:</strong> {patient.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {patient.phone}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className={styles.adminContent}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Buscar paciente por CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton} disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
        {searchError && (
          <p className={styles.searchError}>{searchError}</p>
        )}
        {searchTerm && <button type="button" onClick={() => onSearch('')} className={styles.clearSearchButton}>Limpar Busca</button>}
      </form>

      {renderContent()}
      {/* Indicador de carregamento para as páginas seguintes */}
      {isLoading && patients.length > 0 && <p className={styles.loading}>Carregando mais...</p>}
      {/* Mensagem de fim de lista */}
      {!isLoading && !hasMore && patients.length > 0 && (
        <p className={styles.empty}>Fim dos resultados.</p>
      )}
    </section>
  );
};