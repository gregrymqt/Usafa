import React from 'react';
import './styles.scss'; 

// Componentes
import { Modal } from '../../components/Modal/Modal';
import { ConsultaSummarys } from './components/modal/ConsultaSummary';
import { SidebarLayout } from '../../components/SidebarLayout/SidebarLayout';
import { AgendarConsultaPartial } from './PartialViews/_AgendarConsulta';
import { ListaConsultasPartial } from './PartialViews/_ListaConsultas';

// Hooks e Tipos
import { useConsulta } from './hooks/useConsulta';
import { useAuth } from '../Auth/hooks/useAuth';
import type { ISidebarView } from '../../components/SidebarLayout/types/sidebar.type';

// Ícones
import { FaList, FaCalendarPlus } from 'react-icons/fa'; // Exemplo de ícones melhores

const ConsultaLogo = () => (
  <span style={{ fontWeight: 700 }}>Minhas Consultas</span>
);

const ConsultaPage: React.FC = () => {
  const { user } = useAuth();
  
  // 1. Chamamos o Hook com as novas funcionalidades
  const {
    consultas,
    isLoadingConsultas,
    formOptions, // Traz apenas Tipos e Médicos agora
    isSubmitting,
    handleSubmitConsulta,
    showSuccessMessage,
    confirmedConsulta,
    closeConfirmationModal,
    error,
    loadMoreConsultas,
    
    // --- NOVIDADES AQUI ---
    opcoesHorarios,      // A lista dinâmica que vem do Back
    isLoadingHorarios,   // O loading do select
    buscarHorarios       // A função que será chamada ao trocar o Tipo
  } = useConsulta(user?.publicId?.toString() || '');

  // 2. Definimos as Views
  const consultaViews: ISidebarView[] = [
    {
      name: 'Minhas Consultas',
      icon: <FaList />, 
      component: (
        <ListaConsultasPartial
          consultas={consultas}
          isLoading={isLoadingConsultas}
          hasMore={false}         
          loadMore={loadMoreConsultas}      
        />
      ),
    },
    {
      name: 'Agendar Nova',
      icon: <FaCalendarPlus />,
      component: (
        <AgendarConsultaPartial
          formOptions={formOptions}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmitConsulta}
          
          // 3. Passamos as novas props para a Partial View
          opcoesHorarios={opcoesHorarios}
          isLoadingHorarios={isLoadingHorarios}
          onTipoChange={buscarHorarios} // Conecta o evento do select à função do hook
        />
      ),
    },
  ];

  return (
    <div className="consulta-page-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SidebarLayout 
        views={consultaViews}
        brandLogo={<ConsultaLogo />}
      />

      {/* Modais e Feedbacks Visuais */}
      
      <Modal
        isOpen={!!confirmedConsulta}
        onClose={closeConfirmationModal}
        title="Solicitação Enviada!"
      >
        {confirmedConsulta && (
          <ConsultaSummarys
            summary={confirmedConsulta} 
          />
        )}
      </Modal>
      
      {showSuccessMessage && (
        <div className="success-toast" role="alert">
          Solicitação enviada com sucesso! Aguarde a confirmação.
        </div>
      )}

      {error && (
        <div className="error-toast" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default ConsultaPage;