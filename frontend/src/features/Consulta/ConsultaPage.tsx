import React, { useState } from "react";
import styles from "./ConsultaPage.module.scss";
import { ConsultaSummarys } from "./components/modal/ConsultaSummary";
import { ListaConsultasPartial } from "./PartialViews/Lista/ListaConsultasPartial";
import { AgendarConsultaPartial } from "./PartialViews/Agendar/_AgendarConsulta";
import { useAuth } from "../Auth/hooks/useAuth";
import { useConsulta } from "./hooks/useConsulta";

const ConsultaPage: React.FC = () => {
  const { user } = useAuth();
  const {
    // --- Dados e Ações do Hook ---
    // --- Dados SQL (Confirmadas) ---
    consultas,
    isLoadingConsultas,
    hasMoreConsultas, // Nome atualizado
    loadMoreConsultas,

    // --- Dados Mongo (Solicitações) - NOVO ---
    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes, // Nome atualizado
    loadMoreSolicitacoes,

    // --- Formulário ---
    formOptions,
    opcoesHorarios,
    isLoadingHorarios,
    buscarHorarios, // Equivalente ao onTipoChange da partial
    handleSubmitConsulta,
    isSubmitting,

    // --- Feedback ---
    confirmedConsulta,
    closeConfirmationModal,
    error,
  } = useConsulta(user?.publicId || "");

  // Controle local para mostrar/esconder o formulário (UX Mobile melhor)
  const [showForm, setShowForm] = useState(false);

  // Controla a visibilidade do toast de sucesso
  const [showSuccess, setShowSuccess] = useState(true);
  const handleFormSubmit = async (data: any) => {
    await handleSubmitConsulta(data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000); // Esconde após 5s
  };

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho visível apenas em mobile */}
      <header className={styles.header}>
        <h1>Meus Agendamentos</h1>
        <button
          className={styles.btnToggleForm}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Ver Histórico" : "Agendar Consulta"}
        </button>
      </header>

      {/* Seção do Formulário de Agendamento */}
      <section
        className={`${styles.formSection} ${showForm ? styles.open : ""}`}
      >
        <AgendarConsultaPartial
          formOptions={formOptions}
          isSubmitting={isSubmitting}
          handleSubmit={handleFormSubmit}
          opcoesHorarios={opcoesHorarios}
          isLoadingHorarios={isLoadingHorarios}
          onTipoChange={buscarHorarios}
        />
      </section>

      {/* Conteúdo principal que agrupa banners e a lista */}
      <div className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {showSuccess && (
          <div className={styles.successToast}>
            Solicitação enviada! Acompanhe o status na aba "Solicitações".
          </div>
        )}

        <section className={styles.listSection}>
          <ListaConsultasPartial
            consultas={consultas}
            isLoadingConsultas={isLoadingConsultas}
            hasMoreConsultas={hasMoreConsultas}
            loadMoreConsultas={loadMoreConsultas}
            solicitacoes={solicitacoes}
            isLoadingSolicitacoes={isLoadingSolicitacoes}
            hasMoreSolicitacoes={hasMoreSolicitacoes}
            loadMoreSolicitacoes={loadMoreSolicitacoes}
          />
        </section>
      </div>

      {confirmedConsulta && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <ConsultaSummarys summary={confirmedConsulta} />
            <button
              onClick={closeConfirmationModal}
              className={styles.btnCloseModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultaPage;
