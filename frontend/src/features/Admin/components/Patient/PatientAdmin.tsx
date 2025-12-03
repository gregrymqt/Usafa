import React, { useState } from "react";
import styles from "./PatientAdmin.module.scss";
import type { Patient, PatientAdminProps } from "./types/patient.type";
import { ActionMenu } from "../../../../components/ActionMenu/ActionMenu";
import { useInfiniteScroll } from "../../../../shared/utils/forPages.utils";
import { validateCpf } from "../../../../shared/utils/validators.utils";

export const PatientAdmin: React.FC<PatientAdminProps> = ({
  patients = [], // Proteção contra undefined
  isLoading,
  error,
  hasMore,
  onEditPatient,
  onDeletePatient,
  loadMorePatients,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleDeleteClick = async (patient: Patient) => {
    onDeletePatient(patient); 
  };

  const { lastElementRef } = useInfiniteScroll(
    loadMorePatients,
    hasMore,
    isLoading
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);

    // Validação opcional de CPF
    if (searchTerm && !validateCpf(searchTerm)) {
      setSearchError("CPF inválido. Verifique o número digitado.");
      return;
    }

    onSearch(searchTerm);
  };

  const renderContent = () => {
    if (isLoading && patients.length === 0) {
      return <p className={styles.loading}>Carregando pacientes...</p>;
    }
    if (error) {
      return <p className={styles.error}>Erro: {error}</p>;
    }
    if (patients.length === 0) {
      return <p className={styles.empty}>Nenhum paciente encontrado.</p>;
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
                  <p>CPF: {patient.cpf || "Não informado"}</p>
                  {/* ID do paciente */}
                  {<p className={styles.idText}>ID: {patient.id}</p>}
                </div>
                <ActionMenu
                  onUpdate={() => onEditPatient(patient)}
                  onDelete={() => handleDeleteClick(patient)}
                />
              </div>

              <div className={styles.cardBody}>
                <p>
                  <strong>Email:</strong> <span>{patient.email}</span>
                </p>
                <p>
                  <strong>Telefone:</strong> <span>{patient.phone}</span>
                </p>
                <p>
                  <strong>cpf:</strong> <span>{patient.cpf}</span>
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
      {/* Formulário de Busca */}
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Buscar paciente por CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <button
          type="submit"
          className={styles.searchButton}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Buscar"}
        </button>
        
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSearchError(null);
              onSearch(""); // Limpa a busca no pai
            }}
            className={styles.clearSearchButton}
          >
            Limpar
          </button>
        )}
      </form>
      
      {searchError && <p className={styles.searchError}>{searchError}</p>}

      {renderContent()}

      {/* Loaders e Mensagens de Fim */}
      {isLoading && patients.length > 0 && (
        <p className={styles.loaderText}>
          Carregando mais...
        </p>
      )}
      {!isLoading && !hasMore && patients.length > 0 && (
        <p className={styles.endOfResultsText}>
          Fim dos resultados.
        </p>
      )}
    </section>
  );
};