import React from 'react';
import { AppointmentForm } from '../../components/form/ConsultaForm'; // Ajuste o caminho se necessário
import styles from './_AgendarConsulta.module.scss';
import { useConsultaForm } from '../../hooks/partials/useConsultaForm';
import { ConsultaRequest } from '../../types/consulta.types';

interface AgendarConsultaProps {
  userId: string;
  onSuccess: () => void; // Callback para avisar a Page que deu tudo certo
}

export const AgendarConsultaPartial: React.FC<AgendarConsultaProps> = ({
  userId,
  onSuccess
}) => {
  // 1. O Hook é instanciado AQUI (a Partial é o cérebro)
  const {
    // Estados de carregamento
    isSubmitting,
    isLoadingHorarios,
    
    // Dados para os selects
    tiposOptions,
    horariosOptions,
    
    // Ações de lógica
    handleTipoChange,  // Busca horários quando troca o tipo
    handleSlotChange,  // (Opcional) Se precisar fazer algo quando troca o slot
    submitRequest      // Função que envia para o backend
  } = useConsultaForm(userId);

  // 2. Wrapper para tratar o envio vindo do formulário visual
  const handleSubmitWrapper = async (data: ConsultaRequest) => {
    // Chama o submit do hook passando os dados preenchidos no form
    // OBS: Certifique-se que seu 'submitRequest' no hook aceita receber o objeto 'data'
    const success = await submitRequest(data); 
    
    if (success) {
      onSuccess(); // Avisa a Page para recarregar a lista
    }
  };

  return (
    <div className={styles.agendarConsultaContainer}>
      {/* Verifica se as opções de "Tipos" carregaram. 
        Se sim, mostra o formulário. Se não, mostra o Skeleton.
      */}
      {tiposOptions && tiposOptions.length >= 0 ? (
        <AppointmentForm
          // Passa dados puros
          userId={userId}
          tiposOptions={tiposOptions}
          horariosOptions={horariosOptions}
          isLoadingHorarios={isLoadingHorarios}
          isSubmitting={isSubmitting}
          
          // Passa as funções de controle
          onTipoChange={handleTipoChange}
          onSlotChange={handleSlotChange} // Se o hook não tiver essa, pode remover ou passar vazia
          onSubmit={handleSubmitWrapper}
        />
      ) : (
        // Skeleton Loading para melhor UX enquanto carrega as opções
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