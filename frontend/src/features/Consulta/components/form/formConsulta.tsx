import React, { useMemo, useState } from "react";
import styles from "./ConsultaForm.module.scss";
import AuthForm from "../../../../components/Form/AuthForm";
import { FormField, FormSelectOption } from "../../../../components/Form/types/form.type";
import { ConsultaRequest } from "../../types/consulta.types";


interface AppointmentFormProps {
  // Dados Puros
  userId: string;
  tiposOptions: FormSelectOption[];
  horariosOptions: FormSelectOption[];
  isLoadingHorarios: boolean;
  isSubmitting: boolean;

  // Ações
  onTipoChange: (tipoId: string) => void;
  onSlotChange: (slotId: string) => void;
  onSubmit: (data: ConsultaRequest) => Promise<void>;
  onCancel?: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  userId,
  tiposOptions,
  horariosOptions,
  isLoadingHorarios,
  isSubmitting,
  onTipoChange,
  onSlotChange,
  onSubmit,
  onCancel
}) => {
  // Estados locais APENAS para controle visual dos inputs
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sintomas, setSintomas] = useState<string>("");

  // Handler local para mudança de tipo
  const handleLocalTipoChange = (val: string) => {
    setSelectedTipo(val);
    setSelectedSlot(""); // Reseta slot visualmente
    onTipoChange(val);   // Avisa a Partial para buscar horários
  };

  // Handler local para mudança de slot
  const handleLocalSlotChange = (val: string) => {
    setSelectedSlot(val);
    onSlotChange(val);
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ConsultaRequest = {
        patientId: userId,
        tipoConsultaId: selectedTipo,
        horarioSlotId: selectedSlot,
        sintomas: sintomas
    };
    await onSubmit(payload);
  };

  // 3. Definição dos Campos (HTML Lógico)
  const fields: FormField[] = useMemo(() => [
      {
        elementType: "input",
        type: "text",
        name: "patientId",
        label: "ID do Paciente",
        placeholder: "Cole o ID do paciente...",
        value: userId, 
        // Apenas atualiza visualmente, pois o hook usa o userId passado na inicialização
        onChange: () => {}, 
        required: true,
        disabled: true // Se for paciente comum, deve ser travado
      },
      {
        elementType: "select",
        name: "tipoConsultaId",
        label: "Especialidade",
        value: selectedTipo,
        onChange: (val) => handleLocalTipoChange(val as string), 
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
        onChange: (val) => handleLocalSlotChange(val as string),
        options: horariosOptions,
        required: true,
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
    [userId, selectedTipo, selectedSlot, sintomas, tiposOptions, horariosOptions, isLoadingHorarios]
  );
return (
    <div className={styles.appointmentForm}>
      <h3 className={styles.title}>Novo Agendamento</h3>
      <AuthForm
        fields={fields}
        handleSubmit={handleLocalSubmit}
        isLoading={isSubmitting}
        buttonText="Confirmar Agendamento"
      >
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </AuthForm>
    </div>
  );
};