import React, { useMemo, useState } from "react";
import styles from "./ConsultaForm.module.scss";
import AuthForm from "../../../../components/Form/AuthForm";
import { FormField } from "../../../../components/Form/types/form.type";
import type { FormSelectOption, ConsultaRequest } from "../../types/consulta.types";

export interface ConsultaFormProps {
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

export const AppointmentForm: React.FC<ConsultaFormProps> = ({ 
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
  // Estados locais para controle visual
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [sintomas, setSintomas] = useState<string>("");

  const handleLocalTipoChange = (val: string) => {
    setSelectedTipo(val);
    setSelectedSlot(""); 
    onTipoChange(val); 
  };

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
    // Chamada do pai (que chama o Service)
    await onSubmit(payload);
  };

  const fields: FormField[] = useMemo(() => [
      {
        elementType: "input",
        type: "text",
        name: "patientId",
        label: "ID do Paciente",
        placeholder: "Carregando ID...",
        value: userId, 
        onChange: () => {}, // Read-only visual
        required: true,
        disabled: true 
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