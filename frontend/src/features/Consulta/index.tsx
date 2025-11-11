import React from 'react';

import './styles.scss'; // Importa o SASS da página
import type { Modal } from '../../components/Modal';
import { ConsultaForm } from './components/form/formConsulta';
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
    submittedRequest,
    showSuccessMessage,
    closeSummaryModal,
    error // <-- Para mostrar erros
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

      {/* Parte 3: Modal de Sucesso */}
      <Modal
        isOpen={!!submittedRequest}
        onClose={closeSummaryModal}
        title="Solicitação Recebida!"
      >
        {/* Renderiza o conteúdo do resumo APENAS se houver dados */}
        {submittedRequest && (
          <ConsultaSummary
            summary={submittedRequest}
          />
        )}
      </Modal>
      
      {/* Parte 3b: Mensagem "Iremos entrar em contato..." */}
      {showSuccessMessage && (
        <div className="success-toast" role="alert">
          Iremos entrar em contato para falar sobre a consulta.
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