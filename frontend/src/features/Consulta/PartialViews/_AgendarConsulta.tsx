import React from 'react';
import { ConsultaForm } from '../components/form/formConsulta'; 
import type { ConsultaFormOptions, ConsultaRequest, FormSelectOption } from '../types/consulta.types';

interface AgendarConsultaProps {
  formOptions: ConsultaFormOptions | null;
  isSubmitting: boolean;
  handleSubmit: (request: Partial<ConsultaRequest>) => Promise<void>;
  
  // Novas Props que virão da Page
  opcoesHorarios: FormSelectOption[];
  isLoadingHorarios: boolean;
  onTipoChange: (id: string) => void;
}

export const AgendarConsultaPartial: React.FC<AgendarConsultaProps> = ({
  formOptions,
  isSubmitting,
  handleSubmit,
  opcoesHorarios,     // <--- Recebe
  isLoadingHorarios,  // <--- Recebe
  onTipoChange        // <--- Recebe
}) => {
  return (
    <div>
      {/* Removemos o título duplicado daqui pois já tem dentro do ConsultaForm ou mantém se preferir estilo diferente */}
      
      {formOptions ? (
        <ConsultaForm
          options={formOptions} 
          // Passando as props novas adiante
          opcoesHorarios={opcoesHorarios}
          isLoadingHorarios={isLoadingHorarios}
          onTipoChange={onTipoChange}
          
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