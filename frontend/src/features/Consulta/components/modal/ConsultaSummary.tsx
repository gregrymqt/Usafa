import React from 'react';
import styles from './ConsultaSummary.module.scss';
import { downloadAsTxt, shareContent } from '../../../../shared/';
import type { AppointmentUserResponse } from '../../types/consulta.types';

export interface ConsultaSummaryProps {
  summary: AppointmentUserResponse;
}

const formatConsultaAsText = (summary: AppointmentUserResponse): string => {
  return `
SOLICITAÇÃO DE CONSULTA
Protocolo: ${summary.id}
------------------------------------
Médico:     ${summary.medicoNome}
Tipo:       ${summary.especialidade}
Data:       ${summary.data} às ${summary.horario}
Sintomas:   ${summary.sintomas || 'Nenhum sintoma relatado.'}
  `;
};

export const ConsultaSummarys: React.FC<ConsultaSummaryProps> = ({ summary }) => {
  
  const handleDownload = () => {
    const textContent = formatConsultaAsText(summary);
    const filename = `consulta-${summary.especialidade}-${summary.data}.txt`;
    downloadAsTxt(textContent, filename);
  };

  const handleShare = () => { 
    const shareData: ShareData = {
      title: 'Confirmação de Consulta',
      text: `Minha consulta de ${summary.especialidade} com ${summary.medicoNome} foi confirmada para ${summary.data}.`,
    };
    shareContent(shareData); 
  };

  return (
        <>
          <h2 className={styles.title}>Consulta Confirmada!</h2>
          <p className={styles.subtitle}>
            Sua solicitação foi processada com sucesso.
          </p>
          
          <p className={styles.protocol}>Protocolo: <strong>{summary.id}</strong></p> 
   
          <div className={styles.summaryDetails}> 
            <p><strong>Médico:</strong> {summary.medicoNome}</p>
            <p><strong>Tipo:</strong> {summary.especialidade}</p>
            <p><strong>Data:</strong> {summary.data} às {summary.horario}</p>
            {summary.sintomas && <p><strong>Sintomas:</strong> {summary.sintomas}</p>}
          </div>

          <div className={styles.actions}> 
            <button onClick={handleDownload} className={styles.actionButton}>
              Baixar Confirmação
            </button>
            <button onClick={handleShare} className={styles.actionButton}>
              Compartilhar
            </button>
          </div>
        </>
  );
};