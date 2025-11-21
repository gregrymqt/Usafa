import React from 'react';
import { ConsultaForm } from '../components/form/formConsulta'; // [cite: 14]
import type { ConsultaFormOptions, ConsultaRequest } from '../types/consulta.types';

interface AgendarConsultaProps {
  formOptions: ConsultaFormOptions | null;
  isSubmitting: boolean;
  handleSubmit: (request: ConsultaRequest) => Promise<void>;
}

export const AgendarConsultaPartial: React.FC<AgendarConsultaProps> = ({
  formOptions,
  isSubmitting,
  handleSubmit,
}) => {
  return (
    <div>
      <h2>Solicitar Nova Consulta</h2>
      {formOptions ? (
        <ConsultaForm
          options={formOptions} // [cite: 17-18]
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="form-loading-skeleton">
          Carregando formulário...
        </div>
      )}
    </div>
  );
};