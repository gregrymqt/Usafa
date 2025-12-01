import React from 'react';
import { ConsultaForm } from '../../components/form/formConsulta'; 
import styles from './_AgendarConsulta.module.scss';
import type { ConsultaFormOptions, ConsultaRequest, FormSelectOption } from '../../types/consulta.types';

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
    <div className={styles.agendarConsultaContainer}>
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
        <div className={styles.formLoadingSkeleton}>
          <div className={`${styles.skeletonItem} ${styles.skeletonTitle}`}></div>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={styles.skeletonField}>
              <div className={`${styles.skeletonItem} ${styles.skeletonLabel}`}></div>
              <div className={`${styles.skeletonItem} ${styles.skeletonInput}`}></div>
            </div>
          ))}
          <div className={`${styles.skeletonItem} ${styles.skeletonButton}`}></div>
        </div>
      )}
    </div>
  );
};