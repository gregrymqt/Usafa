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
Protocolo: ${summary.tipo}
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
    const filename = `consulta-${summary.tipo}.txt`;
    
    // 2. Chama a função genérica
    downloadAsTxt(textContent, filename);
  };
  
  /**
   * Chama o utilitário de compartilhamento genérico
   */
  const handleShare = () => { 
    const shareData: ShareData = {
      title: 'Confirmação de Consulta', // <- Texto atualizado
      text: `Minha consulta (Protocolo: ${summary.tipo}) com ${summary.medico} foi confirmada.`, // <- Texto atualizado
    };
    shareContent(shareData); 
  };

  return (
        <>
          {/* Título Atualizado */}
          <h2 className={styles.title}>Consulta Confirmada!</h2>
          <p className={styles.subtitle}>
            Sua solicitação foi processada com sucesso.
          </p>
          
          <p className={styles.protocol}>Protocolo: <strong>{summary.tipo}</strong></p> 
          
          <div className={styles.summaryDetails}> 
            <p><strong>Médico:</strong> {summary.medico}</p>
            <p><strong>Tipo:</strong> {summary.tipo}</p>
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