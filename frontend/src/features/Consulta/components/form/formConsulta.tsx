import React, { useMemo, useState } from "react";
import styles from "./ConsultaForm.module.scss";
import AuthForm from "../../../../components/Form/AuthForm";
import { FormField } from "../../../../components/Form/types/form.type";
import { useConsultaForm } from "../../hooks/partials/useConsultaForm";


interface AppointmentFormProps {
  userId: string; // ID do usuário logado (ou admin)
  onCancel: () => void;
  onSuccess: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  userId, 
  onCancel, 
  onSuccess 
}) => {
  // 1. Instancia o Hook
  const {
    // Estados
    isSubmitting,
    isLoadingHorarios,
    tiposOptions,
    horariosOptions,
    
    // Valores Selecionados
    selectedTipo,
    selectedSlot,
    sintomas,
    setSintomas,
    
    // Ações
    handleTipoChange,
    handleSlotChange,
    submitRequest
  } = useConsultaForm(userId);

  // Estado local apenas para o ID do Paciente (caso seja digitável como na imagem)
  const [localPatientId, setLocalPatientId] = useState(userId);

  // 2. Função de Envio que conecta o Hook
  const handleSubmitWrapper = async (e: React.FormEvent) => {
    e.preventDefault();
    // Passa o valor digitado (localPatientId) para o hook
    const success = await submitRequest(localPatientId); 
    if (success) {
      onSuccess();
    }
};

  // 3. Definição dos Campos (HTML Lógico)
  const fields: FormField[] = useMemo(() => [
      {
        elementType: "input",
        type: "text",
        name: "patientId",
        label: "ID do Paciente",
        placeholder: "Cole o ID do paciente...",
        value: localPatientId, 
        // Apenas atualiza visualmente, pois o hook usa o userId passado na inicialização
        onChange: (val) => setLocalPatientId(val as string), 
        required: true,
        disabled: true // Se for paciente comum, deve ser travado
      },
      {
        elementType: "select",
        name: "tipoConsultaId",
        label: "Especialidade",
        value: selectedTipo,
        // [CORREÇÃO] Passa string direto para o hook
        onChange: (val) => handleTipoChange(val as string), 
        
        // [CORREÇÃO] Usa direto as opções do hook (sem duplicar o "Selecione...")
        options: [
           { value: "", label: "Selecione a especialidade..." }, 
           ...tiposOptions 
        ],
        required: true,
      },
      {
        elementType: "select",
        name: "horarioSlotId",
        label: isLoadingHorarios ? "Buscando horários..." : "Horário / Médico",
        value: selectedSlot,
        // [CORREÇÃO] Passa string (UUID) direto, sem Number()
        onChange: (val) => handleSlotChange(val as string),
        
        options: horariosOptions,
        required: true,
        
        // Lógica visual de travamento
        disabled: !selectedTipo || horariosOptions.length === 0,
        placeholder: !selectedTipo
          ? "Selecione a especialidade primeiro"
          : horariosOptions.length === 0
          ? "Nenhum horário disponível"
          : "Selecione um horário",
      },
      {
        elementType: "textarea",
        name: "sintomas",
        label: "Observações / Sintomas",
        value: sintomas,
        onChange: (val) => setSintomas(val as string),
        placeholder: "Descreva o que está sentindo...",
      },
    ],
    // Dependências para re-renderizar quando algo mudar
    [localPatientId, selectedTipo, selectedSlot, sintomas, tiposOptions, horariosOptions, isLoadingHorarios]
  );

  return (
    <div className={styles.appointmentForm}>
      <h3 className={styles.title}>Novo Agendamento</h3>
      
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmitWrapper} // Usa nosso wrapper
        isLoading={isSubmitting}
        buttonText="Confirmar Agendamento"
      >
        {/* Botão Cancelar Extra */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
      </AuthForm>
    </div>
  );
};