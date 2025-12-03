import React, { useState, useMemo, useEffect } from "react";
import styles from "./AppointmentForm.module.scss";
import AuthForm from "../../../../../../components/Form/AuthForm";
import type { FormField } from "../../../../../../components/Form/types/form.type";
import type { AppointmentStatus } from "../../types/appointment.type";
import { AppointmentFormProps } from "./types/AppointmentForm.types";
import Swal from "sweetalert2";

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  typeOptions,
  slotOptions,
  onTypeChange, // Recebendo a função de atualizar horários
}) => {
  const [patientId, setPatientId] = useState(initialData?.patientId || "");
  const [tipoConsultaId, setTipoConsultaId] = useState(
    initialData?.tipoConsultaId || ""
  );
  const [horarioSlotId, setHorarioSlotId] = useState<string | undefined>(
    initialData?.horarioSlotId
  );
  const [status, setStatus] = useState<AppointmentStatus>(
    initialData?.status || "Agendada"
  );
  const [sintomas, setSintomas] = useState(initialData?.sintomas || "");

  // Efeito para carregar os slots caso seja uma edição
  useEffect(() => {
    if (initialData?.tipoConsultaId) {
      onTypeChange(initialData.tipoConsultaId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Debug: Vamos ver o que tem no estado quando clica
    console.log("Tentando enviar...", {
      patientId,
      tipoConsultaId,
      horarioSlotId,
    });

    // 2. Validação com Feedback Visual
    if (!patientId) {
      Swal.fire("Atenção", "O ID do Paciente é obrigatório.", "warning");
      return;
    }
    if (!tipoConsultaId) {
      Swal.fire("Atenção", "Selecione a Especialidade.", "warning");
      return;
    }
    if (!horarioSlotId) {
      Swal.fire("Atenção", "Selecione um Horário/Médico.", "warning");
      return;
    }

    // 3. Se passou por tudo, envia
    try {
      const selectedSlot = slotOptions.find(
        (slot) => slot.value === horarioSlotId
      );

      await onSubmit({
        patientId,
        tipoConsultaId,
        horarioSlotId,
        status,
        sintomas,
        date: selectedSlot?.label || "",
        time: "",
      });
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  const fields: FormField[] = useMemo(
    () => [
      // --- ALTERAÇÃO AQUI: De Select para Input ---
      {
        elementType: "input", // Mudado para input de texto
        type: "text",
        name: "patientId",
        label: "ID do Paciente",
        placeholder: "Cole o ID ou CPF do paciente aqui...",
        value: patientId,
        onChange: (val) => setPatientId(val as string),
        required: true,
      },
      // ---------------------------------------------
      {
        elementType: "select",
        name: "tipoConsultaId",
        label: "Especialidade",
        value: tipoConsultaId,
        onChange: (val) => {
          const novoTipo = val as string;
          setTipoConsultaId(novoTipo);
          setHorarioSlotId(undefined);
          onTypeChange(novoTipo);
        },
        // CORREÇÃO AQUI:
        options: [
          // 1. Sua opção padrão manual
          { value: "", label: "Selecione a especialidade" },
          // 2. Filtra as opções da API para não repetir o vazio/nulo
          ...typeOptions.filter(
            (opt) => opt.value !== "" && opt.value !== null
          ),
        ],
        required: true,
      },
      {
        elementType: "select",
        name: "horarioSlotId",
        label: "Horário / Médico",
        // Garante que se for undefined vira string vazia para o React não reclamar
        value: horarioSlotId || "", 
        
        onChange: (val) => {
            console.log("Slot Selecionado (PublicID):", val); // Debug para ver se o ID chegou
            setHorarioSlotId(val as string);
        },
        
        options: slotOptions, // A lista que vem do backend já formatada
        required: true,
        disabled: !tipoConsultaId || slotOptions.length === 0,
        placeholder: !tipoConsultaId
          ? "Selecione a especialidade primeiro"
          : slotOptions.length === 0
          ? "Nenhum horário livre"
          : "Selecione um horário", // Texto padrão
      },
      {
        elementType: "select",
        name: "status",
        label: "Status",
        value: status,
        onChange: (val) => setStatus(val as AppointmentStatus),
        options: [
          { value: "Agendada", label: "Agendada" },
          { value: "Concluída", label: "Concluída" },
          { value: "Cancelada", label: "Cancelada" },
          { value: "Pendente", label: "Pendente" },
        ],
        required: true,
      },
      {
        elementType: "textarea",
        name: "sintomas",
        label: "Observações / Sintomas",
        value: sintomas,
        onChange: (val) => setSintomas(val as string),
        placeholder: "Detalhes adicionais...",
      },
    ],
    [
      patientId,
      tipoConsultaId,
      horarioSlotId,
      status,
      sintomas,
      typeOptions,
      slotOptions,
      onTypeChange,
    ]
  );

  return (
    <div className={styles.appointmentForm}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? "Atualizar Agendamento" : "Criar Agendamento"}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
      </AuthForm>
    </div>
  );
};
