import React, { useState, useMemo, useEffect } from "react";
import styles from "./AppointmentForm.module.scss";
import AuthForm from "../../../../../../components/Form/AuthForm";
import type { FormField, FormSelectOption } from "../../../../../../components/Form/types/form.type";
import Swal from "sweetalert2";
import { AppointmentOperation, AppointmentAdminResponse } from "../../types/appointment.type";
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
  const [tipoConsultaId, setTipoConsultaId] = useState(initialData?.tipoConsultaId || "");
  const [horarioSlotId, setHorarioSlotId] = useState<string | undefined>(initialData?.horarioSlotId);
  
  // Status padrão para criação é "AGENDADA"
  const [status, setStatus] = useState<string>(initialData?.status || "AGENDADA");
  const [sintomas, setSintomas] = useState(initialData?.sintomas || "");

  // Carrega os slots iniciais se for edição
  useEffect(() => {
    if (initialData?.tipoConsultaId) {
      onTypeChange(initialData.tipoConsultaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    try {
      // Monta o objeto AppointmentOperation
      const payload: AppointmentOperation = {
        patientId,
        tipoConsultaId,
        horarioSlotId,
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
        disabled: !!initialData 
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
          ...typeOptions.filter((opt) => opt.value !== "" && opt.value !== null),
        ],
        required: true,
      },
      {
        elementType: "select",
        name: "horarioSlotId",
        label: "Horário / Médico",
        value: horarioSlotId || "",
        onChange: (val) => setHorarioSlotId(val as string),
        options: [
          { value: "", label: "Selecione um horário..." }, // Adiciona opção padrão
          ...slotOptions // Espalha as opções vindas do banco
        ],
        required: true,
        disabled: !tipoConsultaId || slotOptions.length === 0,
        placeholder: !tipoConsultaId
          ? "Selecione a especialidade primeiro"
          : slotOptions.length === 0
          ? "Nenhum horário livre"
          : "Selecione um horário",
      },
      {
        elementType: "select",
        name: "status",
        label: "Status",
        value: status,
        onChange: (val) => setStatus(val as string),
        options: [
          { value: "AGENDADA", label: "Agendada" },
          { value: "DISPONIVEL", label: "Disponível" },
          { value: "BLOQUEADO", label: "Bloqueado" },
          { value: "FINALIZADO", label: "Finalizado" },
          { value: "CANCELADO", label: "Cancelado" },
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
    [patientId, tipoConsultaId, horarioSlotId, status, sintomas, typeOptions, slotOptions, onTypeChange, initialData]
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