import React, { useState, useMemo, useEffect } from "react";
import styles from "./AppointmentForm.module.scss";
import AuthForm from "../../../../../../components/Form/AuthForm";
import type {
  FormField,
  FormSelectOption,
} from "../../../../../../components/Form/types/form.type";
import Swal from "sweetalert2";
import {
  AppointmentOperation,
  AppointmentAdminResponse,
} from "../../types/appointment.type";
// Importando os tipos novos

export interface AppointmentFormProps {
  // Alterado para aceitar AppointmentOperation (DTO de envio)
  onSubmit: (data: AppointmentOperation) => Promise<void>;
  onCancel: () => void;
  // Alterado para aceitar o DTO de Leitura na inicialização
  initialData?: AppointmentAdminResponse | null;
  isLoading: boolean;
  typeOptions: FormSelectOption[];
  slotOptions: FormSelectOption[];
  onTypeChange: (tipoId: string) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
  typeOptions,
  slotOptions,
  onTypeChange,
}) => {
  // Inicialização segura dos estados
  const [patientId, setPatientId] = useState(initialData?.pacienteId || "");
  const [tipoConsultaId, setTipoConsultaId] = useState(
    initialData?.tipoConsultaId || ""
  );
  const [horarioSlotId, setHorarioSlotId] = useState<string | undefined>(
    initialData?.horarioSlotId
  );

  // Status padrão para criação é "AGENDADA"
  const [status, setStatus] = useState<string>(
    initialData?.status || "AGENDADA"
  );
  const [sintomas, setSintomas] = useState(initialData?.sintomas || "");

  // Carrega os slots iniciais se for edição
  useEffect(() => {
    if (initialData?.tipoConsultaId) {
      onTypeChange(initialData.tipoConsultaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  const safeSlotOptions = useMemo(() => {
    // Se não é edição ou não tem dados iniciais, usa a lista normal
    if (!initialData || !initialData.horarioSlotId) {
      return slotOptions;
    }

    // Verifica se o slot atual já veio na lista do banco (raro, mas possível)
    const exists = slotOptions.find(
      (opt) => opt.value === initialData.horarioSlotId
    );

    if (!exists) {
      // Se não existe, criamos a opção "artificialmente" para o select não ficar vazio
      const currentOption: FormSelectOption = {
        value: initialData.horarioSlotId,
        // Monta um label bonito para mostrar que é o atual
        label: `${initialData.medicoNome || "Médico Atual"} - ${
          initialData.horario || ""
        } (Selecionado)`,
      };
      // Coloca o atual no topo da lista
      return [currentOption, ...slotOptions];
    }

    return slotOptions;
  }, [slotOptions, initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalPatientId = patientId || initialData?.pacienteId;
    const finalSlotId = horarioSlotId || initialData?.horarioSlotId;
    const finalTipoId = tipoConsultaId || initialData?.tipoConsultaId;

    if (!finalPatientId || !finalTipoId || !finalSlotId) {
      Swal.fire("Atenção", "Dados incompletos para atualização.", "warning");
      return;
    }

    try {
      // Monta o objeto AppointmentOperation
      const payload: AppointmentOperation = {
        patientId: finalPatientId,
        tipoConsultaId: finalTipoId,
        horarioSlotId: finalSlotId,
        status,
        sintomas,
      };

      await onSubmit(payload);
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: "input",
        type: "text",
        name: "patientId",
        label: "ID do Paciente (UUID)",
        placeholder: "Cole o ID do paciente...",
        value: patientId,
        onChange: (val) => setPatientId(val as string),
        required: true,
        // Desabilita edição do paciente se for update, para evitar inconsistência
        disabled: !!initialData,
      },
      {
        elementType: "select",
        name: "tipoConsultaId",
        label: "Especialidade",
        value: tipoConsultaId,
        onChange: (val) => {
          const novoTipo = val as string;
          setTipoConsultaId(novoTipo);
          setHorarioSlotId(undefined); // Reseta o slot ao trocar tipo
          onTypeChange(novoTipo);
        },
        options: [
          { value: "", label: "Selecione a especialidade" },
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
        value: horarioSlotId || "",
        onChange: (val) => setHorarioSlotId(val as string),
        // AQUI ESTÁ A MUDANÇA: Usamos safeSlotOptions em vez de slotOptions
        options: [
          { value: "", label: "Selecione um horário..." },
          ...safeSlotOptions,
        ],
        required: true,
        // Removemos o disabled rígido para permitir ver o que está selecionado
        disabled: !tipoConsultaId,
        placeholder: "Selecione o horário",
      },
      {
        elementType: "select",
        name: "status",
        label: "Status",
        value: status,
        onChange: (val) => setStatus(val as string),
        options: [
          { value: "CONFIRMADA", label: "Confirmada" },
          { value: "PENDENTE", label: "Pendente" },
          { value: "REALIZADA", label: "Realizada" },
          { value: "FINALIZADA", label: "Finalizado" },
          { value: "CANCELADA", label: "Cancelado" },
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
      initialData,
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
