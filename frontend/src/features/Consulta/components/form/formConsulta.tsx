import React, { useState } from "react";
import { type ConsultaRequest } from "../../types/consulta.types";
import styles from "./ConsultaForm.module.scss";
import AuthForm from "../../../../components/Form/AuthForm";
import type {
  FormField,
  FormSelectOption,
} from "../../../../components/Form/types/form.type";

// CORREÇÃO 1: Removemos o Omit. Precisamos do patientId no estado caso seja Admin.
type ConsultaFormState = Partial<ConsultaRequest>;

export interface ConsultaFormProps {
  options: { tipos: FormSelectOption[] };
  opcoesHorarios: FormSelectOption[];
  isLoadingHorarios: boolean;
  onTipoChange: (tipoId: string) => void;
  isSubmitting: boolean;
  onSubmit: (request: Partial<ConsultaRequest>) => Promise<void>;
  isAdmin?: boolean;
  pacientes?: FormSelectOption[];
}

export const ConsultaForm: React.FC<ConsultaFormProps> = ({
  options,
  opcoesHorarios,
  isLoadingHorarios,
  onTipoChange,
  isSubmitting,
  onSubmit,
  isAdmin,
  pacientes,
}) => {
  // CORREÇÃO 2: Inicializamos o patientId no estado
  const [formData, setFormData] = useState<ConsultaFormState>({
    tipoConsultaId: "",
    horarioSlotId: undefined,
    sintomas: "",
    patientId: undefined, 
  });

  const handleChange = (
    field: keyof ConsultaFormState,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTipoSelection = (val: string | number) => {
    const novoTipoId = String(val);
    handleChange("tipoConsultaId", novoTipoId);
    handleChange("horarioSlotId", undefined);
    onTipoChange(novoTipoId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validação básica
    const isValid = formData.tipoConsultaId && formData.horarioSlotId;
    const isAdminValid = isAdmin ? !!formData.patientId : true;

    if (isValid && isAdminValid) {
      await onSubmit(formData as ConsultaRequest);
      
      // Reset do form
      setFormData({
        tipoConsultaId: "",
        horarioSlotId: undefined,
        sintomas: "",
        patientId: undefined,
      });
      onTipoChange(""); 
    }
  };

  // CORREÇÃO 3: Reordenamos os campos. Se for Admin, "Paciente" vem primeiro.
  const fields: FormField[] = [
    // --- CAMPO DE ADMIN (Topo da lista) ---
    ...(isAdmin && pacientes
      ? ([
          {
            elementType: "select",
            name: "patientId", // Agora o TypeScript aceita isso
            label: "Selecione o Paciente",
            value: formData.patientId || "",
            options: pacientes,
            onChange: (val) => handleChange("patientId", Number(val)), // Assumindo que ID é number/long
            required: true,
          },
        ] as FormField[])
      : []),

    // --- CAMPOS PADRÃO ---
    {
      elementType: "select",
      name: "tipoConsultaId",
      label: "Especialidade / Tipo",
      value: formData.tipoConsultaId || "",
      onChange: handleTipoSelection,
      options: options.tipos,
      required: true,
    },
    {
      elementType: "select",
      name: "horarioSlotId",
      label: isLoadingHorarios
        ? "Buscando horários..."
        : "Horários Disponíveis",
      value: formData.horarioSlotId || "",
      onChange: (val) => handleChange("horarioSlotId", Number(val)),
      options: opcoesHorarios,
      required: true,
      placeholder: !formData.tipoConsultaId
        ? "Selecione uma especialidade primeiro"
        : opcoesHorarios.length > 0
        ? "Selecione um horário..."
        : "Nenhum horário livre",
      disabled:
        !formData.tipoConsultaId ||
        isLoadingHorarios ||
        opcoesHorarios.length === 0,
    },
    {
      elementType: "textarea",
      name: "sintomas",
      label: "Sintomas (Opcional)",
      placeholder: "Descreva brevemente seus sintomas...",
      value: formData.sintomas || "",
      onChange: (val) => handleChange("sintomas", String(val)),
    },
  ];

  return (
    <section className={styles.consultaFormSection}>
      <h2>{isAdmin ? "Agendar para Paciente" : "Marcar Nova Consulta"}</h2>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isSubmitting}
        buttonText="Agendar Consulta"
      />
    </section>
  );
};