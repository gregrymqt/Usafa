import React from 'react';
// 1. Importar o Layout Genérico
import { SidebarLayout } from '../../layouts/SidebarLayout/SidebarLayout';
import type { ISidebarView } from '../../layouts/SidebarLayout/types';

import './styles.scss'; // [cite: 14]
import { Modal } from '../../components/Modal'; // [cite: 14]
import { ConsultaSummarys } from './components/modal/ConsultaSummary.tsx'; // 
import { useConsulta } from './hooks/useConsulta'; // 

// 2. Importar as novas parciais
import { _ListaConsultasPartial } from './PartialViews/_ListaConsultas';
import { _AgendarConsultaPartial } from './PartialViews/_AgendarConsulta';

// 3. Ícones (Substitua pelos seus)
const ListIcon = () => <span>L</span>;
const CalendarIcon = () => <span>C</span>;

// Logo para esta sidebar específica
const ConsultaLogo = () => (
  <span style={{ fontWeight: 700 }}>Consultas</span>
);

const ConsultaPage: React.FC = () => {
  // 4. O hook é chamado aqui, no componente "pai"
  const {
    consultas,
    isLoadingConsultas,
    formOptions,
    isSubmitting,
    handleSubmitConsulta,
    showSuccessMessage,
    confirmedConsulta,
    closeConfirmationModal,
    error,
  } = useConsulta("user-123-fake-id"); // [cite: 16-17]

  // 5. Definir as "views" desta sidebar
  const consultaViews: ISidebarView[] = [
    {
      name: 'Minhas Consultas',
      icon: <ListIcon />,
      component: (
        <_ListaConsultasPartial
          consultas={consultas}
          isLoading={isLoadingConsultas}
        />
      ),
    },
    {
      name: 'Agendar Nova',
      icon: <CalendarIcon />,
      component: (
        <_AgendarConsultaPartial
          formOptions={formOptions}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmitConsulta}
        />
      ),
    },
  ];

  return (
    // 6. Wrapper para o layout e os elementos globais (modais, toasts)
    <div className="consulta-page-wrapper" style={{ height: '100vh' }}>
      <SidebarLayout 
        views={consultaViews}
        brandLogo={<ConsultaLogo />}
      />

      {/* 7. Modais e Toasts ficam AQUI, "fora" do layout,
           para flutuar por cima de tudo. */}
      
      <Modal
        isOpen={!!confirmedConsulta} // [cite: 19]
        onClose={closeConfirmationModal}
        title="Consulta Confirmada!"
      >
        {confirmedConsulta && (
          <ConsultaSummarys
            summary={confirmedConsulta} 
          /> // [cite: 19-20]
        )}
      </Modal>
      
      {showSuccessMessage && (
        <div className="success-toast" role="alert">
          Solicitação recebida! Estamos processando... 
        </div> // [cite: 20-21]
      )}

      {error && (
        <div className="error-toast" role="alert">
          {error}
        </div> // [cite: 21]
      )}
    </div>
  );
};
export default ConsultaPage;