import type { ConsultaFormOptions, ConsultaRequest } from "../../../types/consulta.types";

export interface ConsultaFormProps {
  options: ConsultaFormOptions;
  isSubmitting: boolean;
  onSubmit: (request: ConsultaRequest) => Promise<void>;
}