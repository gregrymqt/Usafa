import React, { useMemo, useState } from "react";
import styles from "./ConsultaForm.module.scss";
import AuthForm from "../../../../components/Form/AuthForm";
import { FormField } from "../../../../components/Form/types/form.type";
import type { FormSelectOption, ConsultaRequest } from "../../types/consulta.types";
import Swal from "sweetalert2"; // Importante: Adicione o Swal aqui igual no Admin

export interface ConsultaFormProps {
  userId: string;
  tiposOptions: FormSelectOption[];
  horariosOptions: FormSelectOption[];
  isLoadingHorarios: boolean;
  isSubmitting: boolean;
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

  // --- LÓGICA IGUAL AO ADMIN ---
  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validação Manual (Bloqueia o "Submit Fantasma")
    if (!userId) {
       Swal.fire("Atenção", "Erro ao identificar usuário.", "warning");
       return;
    }
    if (!selectedTipo) {
       Swal.fire("Atenção", "Selecione a Especialidade.", "warning");
       return;
    }
    if (!selectedSlot) {
       // Essa validação impede que o clique no slot envie o form vazio!
       Swal.fire("Atenção", "Selecione um Horário/Médico.", "warning");
       return;
    }

    // 2. Monta o Payload
    const payload: ConsultaRequest = {
        patientId: userId,
        tipoConsultaId: selectedTipo,
        horarioSlotId: selectedSlot,
        sintomas: sintomas
    };

    // 3. Envia (Só chega aqui se tudo estiver preenchido)
    try {
        await onSubmit(payload);
    } catch (err) {
        console.error("Erro no envio:", err);
    }
  };

  const fields: FormField[] = useMemo(() => [
      {
        elementType: "input",
        type: "text",
        name: "patientId",
        label: "ID do Paciente",
        placeholder: "Carregando ID...",
        value: userId, 
        onChange: () => {}, 
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
        // IGUAL AO ADMIN: Adicione a opção default explícita
        options: [
            { value: "", label: "Selecione um horário..." },
            ...horariosOptions
        ],
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