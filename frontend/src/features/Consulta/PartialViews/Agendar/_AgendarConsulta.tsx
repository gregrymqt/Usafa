import React from 'react';
import { AppointmentForm } from '../../components/form/formConsulta';
import styles from './_AgendarConsulta.module.scss';
import { useConsultaForm } from '../../hooks/partials/useConsultaForm'; // O Hook vem AQUI agora
import { ConsultaRequest } from '../../types/consulta.types';

interface AgendarConsultaProps {
  userId: string;
  onSuccess: () => void; // Callback para atualizar a lista na Page
}

export const AgendarConsultaPartial: React.FC<AgendarConsultaProps> = ({
  userId,
  onSuccess
}) => {
  // A Partial assume a responsabilidade do Hook
  const {
    isSubmitting,
    isLoadingHorarios,
    tiposOptions,
    horariosOptions,
    // Note que removemos os estados visuais (selectedTipo, sintomas) daqui
    // pois eles ficam no form, mas mantemos as ações lógicas
    handleTipoChange,
    handleSlotChange, 
    submitRequest
  } = useConsultaForm(userId);

  // Wrapper para processar o envio vindo do filho
  const handleSubmitWrapper = async (data: ConsultaRequest) => {
    // Aqui você pode adaptar se o seu submitRequest esperar argumentos diferentes
    // Assumindo que seu hook foi ajustado para receber o payload ou os IDs:
    
    // Opção A: Se seu hook já tem o estado interno (mas movemos o estado pro form visual...)
    // O ideal é que o submitRequest aceite o payload completo agora:
    const success = await submitRequest(data); 
    
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className={styles.agendarConsultaContainer}>
      {/* Se tiposOptions estiver vazio, mostra loading ou form */}
      {tiposOptions.length >= 0 ? (
        <AppointmentForm
          userId={userId}
          tiposOptions={tiposOptions}
          horariosOptions={horariosOptions}
          isLoadingHorarios={isLoadingHorarios}
          isSubmitting={isSubmitting}
          
          // Passando as funções de lógica
          onTipoChange={handleTipoChange}
          onSlotChange={handleSlotChange}
          onSubmit={handleSubmitWrapper}
        />
      ) : (
        <div className={styles.formLoadingSkeleton}>
           {/* Seu Skeleton Loading... */}
           Loading...
        </div>
      )}
    </div>
  );
};