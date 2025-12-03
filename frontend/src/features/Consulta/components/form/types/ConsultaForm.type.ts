import type { ConsultaFormOptionsResponse, ConsultaRequest } from "../../../types/consulta.types";

export interface ConsultaFormProps {
  options: ConsultaFormOptionsResponse;
  isSubmitting: boolean;
  onSubmit: (request: ConsultaRequest) => Promise<void>;
}