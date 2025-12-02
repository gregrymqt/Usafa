// src/features/Admin/TipoConsulta/index.tsx
import React from "react";
import styles from "./appointmentType.module.scss";

// Componentes
import { ActionMenu } from "../../../../components/ActionMenu/ActionMenu";
import AuthForm from "../../../../components/Form/AuthForm";
import Table from "../../../../components/Tables/Tables";
import { ColumnType } from "../../../../components/Tables/types";
import { TipoConsultaTableData } from "./types/appointmentType.type";

// Hook
import { useAppointmentType } from "./hooks/useAppointmentType";

/**
 * Componente responsável por gerenciar Tipos de Consulta
 *
 * @returns {JSX.Element}
 *
 * @example
 * <TipoConsultaManager />
 */
const TipoConsultaManager: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLoadingTypes,
    tipos,
    editingItem,
    handleDelete,
    handleEditSetup,
    handleCancelEdit,
    handleSubmit,
    formFields,
  } = useAppointmentType();

  // Configuração Visual das Colunas
  const columns: ColumnType<TipoConsultaTableData>[] = [
    { header: "Especialidade", accessor: "nome" },
    { header: "Ações", accessor: "acoes" },
  ];

  // Transformação de Dados para a Tabela (View Logic apenas)
  const tableData: TipoConsultaTableData[] = tipos.map((item) => ({
    nome: item.nome,
    acoes: (
      <ActionMenu
        onUpdate={() => handleEditSetup(item)}
        onDelete={() => handleDelete(item.publicId)}
      />
    ),
  }));

  return (
    <div className={styles.pageContainer}>
      {" "}
      <h2>Gerenciar Tipos de Consulta</h2>
      {/* Navegação de Abas */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "list" ? styles.active : ""}
          onClick={handleCancelEdit} // Usa o cancel para garantir reset ao voltar pra lista
        >
          Listagem
        </button>
        <button
          className={activeTab === "form" ? styles.active : ""}
          onClick={() => setActiveTab("form")}
        >
          {editingItem ? "Editar Tipo" : "Novo Tipo"}
        </button>
      </div>
      {/* Conteúdo */}
      <div className={styles.contentArea}>
        {activeTab === "list" ? (
            !isLoadingTypes && tipos.length === 0 ? (
            <p>Carregando dados...</p>
          ) : (
            <Table<TipoConsultaTableData> colunas={columns} dados={tableData} />
          )
        ) : (
          <AuthForm
            fields={formFields}
            handleSubmit={handleSubmit}
            isLoading={isLoadingTypes}
            buttonText={editingItem ? "Atualizar" : "Cadastrar"}
          >
            <div
              style={{
                marginBottom: "1rem",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              {editingItem
                ? `Editando: ${editingItem.nome}`
                : "Preencha os dados abaixo para criar uma nova especialidade."}
            </div>
          </AuthForm>
        )}
      </div>
    </div>
  );
};

export default TipoConsultaManager;
