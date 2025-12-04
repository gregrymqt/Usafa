import React from 'react';
import styles from './ConsultaSummary.module.scss';
import { downloadAsTxt, shareContent } from '../../../../shared/';
// Certifique-se que o caminho da importação está correto para o seu projeto
import { type SolicitacaoSummary } from '../../types/consulta.types'; 
import type { ConsultaSummaryProps } from './types/modal.types';

const formatConsultaAsText = (summary: SolicitacaoSummary): string => {
  // CORREÇÃO: Usando 'appointmentTypeName' e 'doctorName' conforme a interface SolicitacaoSummary
  return `
SOLICITAÇÃO DE CONSULTA
Protocolo: ${summary.id}
------------------------------------
Médico:     ${summary.doctorName}
Tipo:       ${summary.appointmentTypeName}
Data:       ${summary.dia} às ${summary.horario}
Sintomas:   ${summary.sintomas || 'Nenhum sintoma relatado.'}
  `;
};

export const ConsultaSummarys: React.FC<ConsultaSummaryProps> = ({ summary }) => {
  
  const handleDownload = () => {
    const textContent = formatConsultaAsText(summary);
    // CORREÇÃO: Propriedade correta para o nome do arquivo
    const filename = `consulta-${summary.appointmentTypeName}.txt`;
    downloadAsTxt(textContent, filename);
  };

  const handleShare = () => { 
    const shareData: ShareData = {
      title: 'Confirmação de Consulta',
      // CORREÇÃO: Propriedade correta para o texto de compartilhamento
      text: `Minha consulta de ${summary.appointmentTypeName} com ${summary.doctorName} foi confirmada.`,
    };
    shareContent(shareData); 
  };

  return (
        <>
          <h2 className={styles.title}>Consulta Confirmada!</h2>
          <p className={styles.subtitle}>
            Sua solicitação foi processada com sucesso.
          </p>
          
          {/* CORREÇÃO: Propriedade correta para exibição */}
          <p className={styles.protocol}>Protocolo: <strong>{summary.id}</strong></p> 
   
          <div className={styles.summaryDetails}> 
            {/* CORREÇÃO: Ajuste de nomes das propriedades (medico -> doctorName, tipo -> appointmentTypeName) */}
            <p><strong>Médico:</strong> {summary.doctorName}</p>
            <p><strong>Tipo:</strong> {summary.appointmentTypeName}</p>
            <p><strong>Data:</strong> {summary.dia} às {summary.horario}</p>
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