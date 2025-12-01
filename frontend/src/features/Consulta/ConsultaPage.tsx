import React, { useState } from 'react';
import styles from './ConsultaPage.module.scss'; // Assumindo CSS da página
import { useConsulta } from './hooks/useConsulta';
import { ConsultaSummarys } from './components/modal/ConsultaSummary';
import { ListaConsultasPartial } from './PartialViews/Lista/ListaConsultasPartial';
import { AgendarConsultaPartial } from './PartialViews/Agendar/_AgendarConsulta';

export const ConsultaPage: React.FC<{ userId: string }> = ({ userId }) => {
  // 1. Consome o Hook Refatorado com os novos nomes
  const {
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
    showSuccessMessage
  } = useConsulta(userId);

  // Controle local para mostrar/esconder o formulário (UX Mobile melhor)
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Meus Agendamentos</h1>
        {/* Botão para Mobile - Toggle do formulário */}
        <button 
            className={styles.btnToggleForm} 
            onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Fechar Formulário' : 'Nova Consulta'}
        </button>
      </header>

      {/* Feedback de Erro/Sucesso */}
      {error && <div className={styles.errorBanner}>{error}</div>}
      {showSuccessMessage && (
        <div className={styles.successToast}>
           Solicitação enviada! Acompanhe na aba "Solicitações".
        </div>
      )}

      {/* 2. Modal ou Seção de Agendamento */}
      {/* Renderiza apenas se tiver opções carregadas ou estiver aberto */}
      <section className={`${styles.formSection} ${showForm ? styles.open : ''}`}>
        <AgendarConsultaPartial 
            formOptions={formOptions}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmitConsulta}
            // Props novas que a Partial espera [cite: 13, 14]
            opcoesHorarios={opcoesHorarios}
            isLoadingHorarios={isLoadingHorarios}
            onTipoChange={buscarHorarios} 
        />
      </section>

      {/* 3. Lista com Abas (SQL e Mongo) */}
      <section className={styles.listSection}>
        {/* Passando as props novas para a Partial atualizada  */}
        <ListaConsultasPartial
            // SQL
            consultas={consultas}
            isLoadingConsultas={isLoadingConsultas}
            hasMoreConsultas={hasMoreConsultas}
            loadMoreConsultas={loadMoreConsultas}
            // Mongo
            solicitacoes={solicitacoes}
            isLoadingSolicitacoes={isLoadingSolicitacoes}
            hasMoreSolicitacoes={hasMoreSolicitacoes}
            loadMoreSolicitacoes={loadMoreSolicitacoes}
        />
      </section>

      {/* 4. Modal de Confirmação em Tempo Real (WebSocket) */}
      {confirmedConsulta && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
             {/* Componente de Resumo [cite: 31] */}
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