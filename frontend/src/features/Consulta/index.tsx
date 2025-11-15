import React from 'react';

import './styles.scss'; // Importa o SASS da página
import { Modal } from '../../components/Modal';
import { ConsultaForm } from './components/form/formConsulta';
import { ConsultaSummarys } from './components/modal/ConsultaSummary.tsx'; // <-- 1. Importa o COMPONENTE
import { ConsultaList } from './components/table/listConsulta';
import { useConsulta } from './hooks/useConsulta';

 const ConsultaPage: React.FC = () => { 
  // Assumindo que o ID do usuário vem de um contexto de Autenticação
  const {
    consultas,
    isLoadingConsultas,
    formOptions,
    isSubmitting,
    handleSubmitConsulta,
    showSuccessMessage, // Mensagem rápida (ex: "Processando...")
    confirmedConsulta,    // O DTO que vem do WebSocket
    closeConfirmationModal, // Ação para fechar o modal
    error
  } = useConsulta("user-123-fake-id"); // (ID do usuário mocado)

  return (
    <div className="consulta-page">
      
      {/* Parte 1: Tabela (Área 1) */}
      <ConsultaList
        consultas={consultas}
        isLoading={isLoadingConsultas}
      />
      
      {/* Parte 2: Formulário (Área 2) */}
      {formOptions ? (
        <ConsultaForm
          options={formOptions}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitConsulta}
        />
      ) : (
        // Loading skeleton para o formulário
        <div className="form-loading-skeleton">
          Carregando formulário...
        </div>
      )}

      {/* --- MODAL ATUALIZADO --- */}
      {/* Agora é acionado pelo 'confirmedConsulta' que vem do WebSocket */}
      <Modal
       isOpen={!!confirmedConsulta}
       onClose={closeConfirmationModal}
        title="Consulta Confirmada!" // Título atualizado
      >
        {confirmedConsulta && (
          <ConsultaSummarys
           summary={confirmedConsulta} 
          />
        )}
      </Modal>
      
      {/* Mensagem rápida de "Solicitação enviada" */}
      {showSuccessMessage && (
        <div className="success-toast" role="alert">
          Solicitação recebida! Estamos processando... [cite: 20]
        </div>
      )}

      {/* Exibição de Erro Geral */}
      {error && (
        <div className="error-toast" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
export default ConsultaPage;