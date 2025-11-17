import type { ConsultaDocument } from "../../Table/types/consultaRequestTable.type";

/**
 * Os dados que este formulário pode editar
 */
export interface ConsultaUpdateData {
  status: string;
  dia: string;
  horario: string;
}

export interface ConsultaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ConsultaDocument | null; // A consulta que estamos editando
  onSubmit: (id: string, data: ConsultaUpdateData) => void; // Função do hook
}