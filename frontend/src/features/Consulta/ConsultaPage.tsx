import React, { useState } from "react";
import styles from "./ConsultaPage.module.scss";
import { ConsultaSummarys } from "./components/modal/ConsultaSummary";
import { ListaConsultasPartial } from "./PartialViews/Lista/ListaConsultasPartial";
import { AgendarConsultaPartial } from "./PartialViews/Agendar/_AgendarConsulta";
import { useAuth } from "../Auth/hooks/useAuth";
import { useConsulta } from "./hooks/useConsulta";

const ConsultaPage: React.FC = () => {
  const { user } = useAuth();
  
  // O Hook da Page agora só cuida de LISTAS (GET)
  const {
    consultas,
    isLoadingConsultas,
    hasMoreConsultas,
    loadMoreConsultas,

    solicitacoes,
    isLoadingSolicitacoes,
    hasMoreSolicitacoes,
    loadMoreSolicitacoes,
    
    refreshAll, // Importante ter um refresh geral
    error,
    confirmedConsulta,
    closeConfirmationModal
  } = useConsulta(user?.publicId || ""); // Use o hook de Listas aqui, não o de Form

  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Callback simples: Se o form (Partial) der sucesso, recarrega as listas e avisa
  const handleFormSuccess = () => {
    setShowSuccess(true);
    setShowForm(false); // Fecha o form mobile se quiser
    refreshAll();       // Recarrega as listas
    setTimeout(() => setShowSuccess(false), 5000);
  };

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

      <section className={`${styles.formSection} ${showForm ? styles.open : ""}`}>
        {/* CHAMADA LIMPA: A Partial resolve tudo sozinha agora */}
        <AgendarConsultaPartial 
            userId={user?.publicId || ""} 
            onSuccess={handleFormSuccess} 
        />
      </section>

      <div className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {showSuccess && (
          <div className={styles.successToast}>
            Solicitação enviada com sucesso!
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
