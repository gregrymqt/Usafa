import React, { useState, useMemo, useEffect } from "react";
import AuthForm from "../../../../../components/Form/AuthForm";
import type { FormField } from "../../../../../components/Form/types/form.type";
import { FaUserDoctor } from "react-icons/fa6";
import type { NewDoctorData, Doctor } from "../types/doctor.type";
import styles from "./DoctorForm.module.scss";
import { useAppointmentType } from "../../appointmentType/hooks/useAppointmentType";
import { validateEmail } from "../../../../../shared/utils/validators.utils";

interface DoctorFormProps {
  onSubmit: (data: NewDoctorData) => Promise<void>;
  onCancel: () => void;
  initialData?: Doctor | null;
  isLoading: boolean;
}

export const DoctorForm: React.FC<DoctorFormProps> = ({
  onSubmit,
  onCancel,
  initialData = null,
  isLoading,
}) => {
  const { tipos, isLoadingTypes } = useAppointmentType();

  const validateCrm = (crm: string): boolean => {
    const crmRegex = /^CRM\/SP \d{5}$/;
    return crmRegex.test(crm);
  };

  // Estados dos campos de texto
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [crm, setCrm] = useState(initialData?.crm || "");
  const [specialty, setSpecialty] = useState(initialData?.specialty || "");

  // Estados de erro para validação
  const [emailError, setEmailError] = useState<string | undefined>();
  const [crmError, setCrmError] = useState<string | undefined>();

  useEffect(() => {
    if (!initialData && !specialty && tipos.length > 0) {
      setSpecialty(tipos[0].publicId);
    }
  }, [tipos, specialty, initialData]);

  // Estados do arquivo de imagem
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState(initialData?.picture || "");

  // Handler para seleção do arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handler de envio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final antes do envio
    if (!validateEmail(email) || !validateCrm(crm)) {
      console.error("Formulário com dados inválidos.");
      return; // Impede o envio se houver erros
    }

    // Monta o objeto final combinando texto e arquivo
    const doctorData: NewDoctorData = {
      name,
      email,
      crm,
      specialty,
      imageFile, // O arquivo vai aqui
    };

    try {
      await onSubmit(doctorData);
    } catch (error) {
      console.error("Erro no formulário:", error);
    }
  };

  const specialtyOptions = useMemo(() => {
    return tipos.map((t) => ({
      value: t.publicId, // Aqui enviamos o ID para o banco. Se precisar do nome, mude para t.nome
      label: t.nome, // O que aparece para o usuário ler
    }));
  }, [tipos]);

  // Definição dos campos de texto para o AuthForm
  const fields: FormField[] = useMemo(
    () => [
      {
        elementType: "input",
        type: "text",
        name: "name",
        label: "Nome Completo",
        placeholder: "Dr. Nome Sobrenome",
        value: name,
        onChange: (val) => setName(val as string),
        required: true,
      },
      {
        elementType: "input",
        type: "email",
        name: "email",
        label: "Email",
        placeholder: "email@dominio.com",
        value: email,
        onChange: (val) => {
          const newEmail = val as string;
          setEmail(newEmail);
          if (!validateEmail(newEmail)) {
            setEmailError("Formato de email inválido.");
          } else {
            setEmailError(undefined);
          }
        },
        required: true,
        error: emailError,
      },
      {
        elementType: "input",
        type: "text",
        name: "crm",
        label: "CRM",
        placeholder: "CRM/SP 123456",
        value: crm,
        onChange: (val) => {
          const newCrm = val as string;
          setCrm(newCrm);
          if (!validateCrm(newCrm)) {
            setCrmError("O CRM deve seguir o padrão: CRM/SP 123456");
          } else {
            setCrmError(undefined);
          }
        },
        required: true,
        error: crmError,
      },
      {
        elementType: "select",
        name: "specialty",
        label: "Especialidade / Tipo de Consulta",
        value: specialty,
        onChange: (val) => setSpecialty(val as string),
        // Passamos as opções dinâmicas aqui
        options: specialtyOptions,
        // Opcional: desabilita enquanto carrega os tipos
        disabled: isLoadingTypes,
        className: styles.specialtySelect, // Classe para estilização
      },
    ],
    // IMPORTANTE: Adicionar specialtyOptions e isLoadingTypes nas dependências
    [
      name,
      email,
      crm,
      specialty,
      specialtyOptions,
      isLoadingTypes,
      emailError,
      crmError,
    ]
  );

  return (
    <div className={styles.doctorFormContainer}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        buttonText={initialData ? "Atualizar" : "Criar"}
      >
        {/* Seção de Upload de Foto */}
        <div className={styles.photoUploadSection}>
          <div className={styles.previewContainer}>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className={styles.previewImage}
              />
            )}
            {!previewUrl && (
              <div className={styles.placeholder}>
                <FaUserDoctor />
              </div>
            )}
          </div>
          <div className={styles.uploadControls}>
            <label htmlFor="doctor-photo" className={styles.sectionTitle}>
              Foto de Perfil
            </label>
            <label htmlFor="doctor-photo" className={styles.fileInputLabel}>
              {imageFile ? "Trocar imagem" : "Selecionar imagem"}
            </label>
            <input
              id="doctor-photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Ações do formulário */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </AuthForm>
    </div>
  );
};
