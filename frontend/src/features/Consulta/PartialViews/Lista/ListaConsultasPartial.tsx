import React, { useState } from "react";
import { ConsultaList } from "../../components/table/listConsulta";
import styles from "./ListaConsultas.module.scss"; 
import { SolicitacaoList } from "../../components/request/SolicitacaoList";
// CORREÇÃO: Importando a nova interface correta
import type { AppointmentUserResponse } from "../../types/consulta.types";

interface ListaConsultasProps {
  // CORREÇÃO: Alterado de SolicitacaoSummary para AppointmentUserResponse
  consultas: AppointmentUserResponse[];
  isLoadingConsultas: boolean;
  hasMoreConsultas: boolean;
  loadMoreConsultas: () => void;

  // Props Solicitações
  solicitacoes: AppointmentUserResponse[];
  isLoadingSolicitacoes: boolean;
  hasMoreSolicitacoes: boolean;
  loadMoreSolicitacoes: () => void;
}

export const ListaConsultasPartial: React.FC<ListaConsultasProps> = ({
  consultas,
  isLoadingConsultas,
  hasMoreConsultas,
  loadMoreConsultas,
  solicitacoes,
  isLoadingSolicitacoes,
  hasMoreSolicitacoes,
  loadMoreSolicitacoes,
}) => {
  const [activeTab, setActiveTab] = useState<"consultas" | "requests">("consultas");

  return (
    <div className={styles.container}>
      {/* --- ABAS DE NAVEGAÇÃO --- */}
      <div className={styles.tabsHeader}>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "consultas" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("consultas")}
        >
          Confirmadas
          {/* Badge contador opcional */}
          {consultas.length > 0 && (
            <span className={styles.counter}>{consultas.length}</span>
          )}
        </button>

        <button
          className={`${styles.tabBtn} ${
            activeTab === "requests" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Solicitações
          {solicitacoes.length > 0 && (
            <span className={styles.counter}>{solicitacoes.length}</span>
          )}
        </button>
      </div>

      {/* --- CONTEÚDO --- */}
      <div className={styles.tabContent}>
        {activeTab === "consultas" ? (
          <ConsultaList
            consultas={consultas || []}
            isLoading={isLoadingConsultas}
            hasMore={hasMoreConsultas}
            loadMore={loadMoreConsultas}
          />
        ) : (
          <SolicitacaoList
            solicitacoes={solicitacoes || []}
            isLoading={isLoadingSolicitacoes}
            hasMore={hasMoreSolicitacoes}
            loadMore={loadMoreSolicitacoes}
          />
        )}
      </div>
    </div>
  );
};