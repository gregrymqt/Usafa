import React from 'react';
import styles from './ConsultaSummary.module.scss';
// Importa as novas funções genéricas
import { downloadAsTxt, shareContent } from '../../../../shared/';
import { type ConsultaSummary } from '../../types/consulta.types.ts';
import type { ConsultaSummaryProps } from './types/modal.types';

/**
 * (Função de formatação agora local)
 * Formata os dados da consulta como um texto simples.
 */
const formatConsultaAsText = (summary: ConsultaSummary): string => {
  return `
SOLICITAÇÃO DE CONSULTA
Protocolo: ${summary.protocolo}
------------------------------------
Médico:     ${summary.medico}
Tipo:       ${summary.tipo}
Data:       ${summary.dia} às ${summary.horario}
Sintomas:   ${summary.sintomas || 'Nenhum sintoma relatado.'}
  `;
};


export const ConsultaSummarys: React.FC<ConsultaSummaryProps> = ({ summary }) => {
  
  /**
   * Chama o utilitário de download genérico
   */
  const handleDownload = () => {
    // 1. Formata os dados específicos da consulta
    const textContent = formatConsultaAsText(summary);
    const filename = `consulta-${summary.protocolo}.txt`;
    
    // 2. Chama a função genérica
    downloadAsTxt(textContent, filename);
  };
  
  /**
   * Chama o utilitário de compartilhamento genérico
   */
  const handleShare = () => {
    // 1. Prepara os dados específicos da consulta
    const shareData: ShareData = {
      title: 'Requisição de Consulta',
      text: `Minha requisição de consulta (Protocolo: ${summary.protocolo}) com ${summary.medico}.`,
    };
    
    // 2. Chama a função genérica
    shareContent(shareData);
  };

  return (
        <>
          <p className={styles.protocol}>Protocolo: <strong>{summary.protocolo}</strong></p>
          
          <div className={styles.summaryDetails}>
            <p><strong>Médico:</strong> {summary.medico}</p>
            <p><strong>Tipo:</strong> {summary.tipo}</p>
            <p><strong>Data:</strong> {summary.dia} às {summary.horario}</p>
            {summary.sintomas && <p><strong>Sintomas:</strong> {summary.sintomas}</p>}
          </div>

          <div className={styles.actions}>
            <button onClick={handleDownload} className={styles.actionButton}>
              Baixar Requisição
            </button>
            <button onClick={handleShare} className={styles.actionButton}>
              Compartilhar
            </button>
          </div>
        </>
  );
};