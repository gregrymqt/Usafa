import React, { useEffect, useState } from "react";
import styles from "./ConsultaPage.module.scss";
import { ConsultaSummarys } from "./components/modal/ConsultaSummary";
import { ListaConsultasPartial } from "./PartialViews/Lista/ListaConsultasPartial";
import { useAuth } from "../Auth/hooks/useAuth";
import { useConsulta } from "./hooks/useConsulta";
import { AppointmentForm } from "./components/form/ConsultaForm";
import { ConsultaRequest } from "./types/consulta.types";

const ConsultaPage: React.FC = () => {
  const { user } = useAuth();

  // Hook Principal
  const {
    // Listas
    consultas,
    isLoadingConsultas,
    hasMoreConsultas,
    loadMoreConsultas,
    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    loadMoreSolicitacoes,

    // Form States
    tiposOptions,
    opcoesHorarios,
    isLoadingHorarios,
    buscarHorarios,
    handleSlotChange,
    handleSubmitConsulta,
    isSubmitting,

    // Feedback
    error,
    confirmedConsulta,
    closeConfirmationModal,
  } = useConsulta(user?.publicId || "");

  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Wrapper para o submit que adiciona feedback visual local
  const onFormSubmitWrapper = async (data: ConsultaRequest) => {
    await handleSubmitConsulta(data);
    // Remova toda a lógica de setShowSuccess daqui!
  };

  useEffect(() => {
    if (confirmedConsulta) {
      setShowSuccess(true);
      setShowForm(false);

      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [confirmedConsulta]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Meus Agendamentos</h1>
        <button
          className={styles.btnToggleForm}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Ver Histórico" : "Agendar Consulta"}
        </button>
      </header>

      <section
        className={`${styles.formSection} ${showForm ? styles.open : ""}`}
      >
        {/* Renderizando o Form Component diretamente com props do Hook */}
        <AppointmentForm
          userId={user?.publicId || ""}
          tiposOptions={tiposOptions}
          horariosOptions={opcoesHorarios}
          isLoadingHorarios={isLoadingHorarios}
          isSubmitting={isSubmitting}
          onTipoChange={buscarHorarios}
          onSlotChange={handleSlotChange}
          onSubmit={onFormSubmitWrapper}
          onCancel={() => setShowForm(false)}
        />
      </section>

      <div className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {showSuccess && (
          <div className={styles.successToast}>
            Solicitação processada com sucesso!
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
