import React, { useMemo, useState } from "react";
import styles from "./AppointmentRequestTable.module.scss";
import { ActionMenu } from "../../../../../../../components/ActionMenu/ActionMenu";
import type { ColumnType } from "../../../../../../../components/Tables/types";
import Table from "../../../../../../../components/Tables/Tables";
import { useAppointmentRequests } from "../../../hooks/useAppointmentRequest"; // Ajuste o nome do arquivo do hook se necessário
import { ConsultaEditModal } from "../Modal/AppointmentEditModal";
import { AppointmentAdminResponse } from "../../../types/appointment.type";
// Import novo

interface TableRowData {
  id: string;
  paciente: string;
  medico: string;
  data: string;
  status: React.ReactNode;
  actions: React.ReactNode;
}

const columns: ColumnType<TableRowData>[] = [
  { header: "Paciente", accessor: "paciente" },
  { header: "Médico", accessor: "medico" },
  { header: "Data/Hora", accessor: "data" }, // Título ajustado
  { header: "Status", accessor: "status" },
  { header: "Ações", accessor: "actions" },
];

export const ConsultaRequestTable: React.FC = () => {
  const {
    requests, // Agora é AppointmentAdminResponse[]
    isLoading,
    error,
    handleUpdateStatus,
    handleDeleteRequest,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  } = useAppointmentRequests();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<AppointmentAdminResponse | null>(null);

  const handleOpenModal = (request: AppointmentAdminResponse) => {
    setEditingRequest(request);
    setIsModalOpen(true);
  };

  const tableData: TableRowData[] = useMemo(() => {
    if (!requests) return [];

    return requests.map((req) => ({
      id: req.id,
      // Usando as propriedades planas do novo DTO
      paciente: req.pacienteNome || "Desconhecido", 
      medico: req.medicoNome || "Não atribuído",
      // Como o DTO já manda strings formatadas (data e horario), apenas concatenamos
      data: `${req.data} às ${req.horario}`, 
      status: (
        <span
          className={`${styles.statusBadge} ${
            styles[`status${req.status?.toLowerCase()}`] || styles.statusDefault
          }`}
        >
          {req.status}
        </span>
      ),
      actions: (
        <ActionMenu
          onUpdate={() => handleOpenModal(req)}
          onDelete={() => handleDeleteRequest(req.id)}
        />
      ),
    }));
  }, [requests, handleDeleteRequest]);

  if (isLoading) return <p className={styles.loading}>Carregando solicitações...</p>;
  if (error) return <p className={styles.error}>Erro: {error.message}</p>;

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label>Buscar Paciente</label>
          <input
            type="text"
            placeholder="Nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="ACEITA">Aceita</option>
            <option value="RECUSADA">Recusada</option>
          </select>
        </div>
      </div>

      <Table<TableRowData> colunas={columns} dados={tableData} />

      <ConsultaEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={editingRequest}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
};