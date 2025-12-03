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
    return crm.length > 5; 
  };

  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [crm, setCrm] = useState(initialData?.crm || "");
  const [specialty, setSpecialty] = useState(initialData?.specialtyId || "");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState(initialData?.picture || "");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [crmError, setCrmError] = useState<string | undefined>();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setCrm(initialData.crm);
      setSpecialty(initialData.specialtyId);
      setPreviewUrl(initialData.picture || "");
    } else if (!specialty && tipos.length > 0) {
      setSpecialty(tipos[0].publicId);
    }
  }, [initialData, tipos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email) || !validateCrm(crm)) {
      if(!validateEmail(email)) setEmailError("Email inválido");
      if(!validateCrm(crm)) setCrmError("CRM inválido");
      return;
    }
    const doctorData: NewDoctorData = { name, email, crm, specialty, imageFile };
    try {
      await onSubmit(doctorData);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  const specialtyOptions = useMemo(() => {
    return tipos.map((t) => ({ value: t.publicId, label: t.nome }));
  }, [tipos]);

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
          setEmailError(!validateEmail(newEmail) ? "Formato inválido" : undefined);
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
          setCrmError(!validateCrm(newCrm) ? "CRM inválido" : undefined);
        },
        required: true,
        error: crmError,
      },
      {
        elementType: "select",
        name: "specialty",
        label: "Especialidade",
        value: specialty,
        onChange: (val) => setSpecialty(val as string),
        options: specialtyOptions,
        disabled: isLoadingTypes,
        className: styles.specialtySelect,
      },
    ],
    [name, email, crm, specialty, specialtyOptions, isLoadingTypes, emailError, crmError]
  );

  return (
    <div className={styles.doctorFormContainer}>
      <AuthForm
        fields={fields}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        // [CORREÇÃO AQUI] Passar string vazia remove o botão padrão duplicado
        buttonText="" 
      >
        <div className={styles.photoUploadSection}>
          <div className={styles.previewContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholder}><FaUserDoctor /></div>
            )}
          </div>
          <div className={styles.uploadControls}>
            <label htmlFor="doctor-photo" className={styles.sectionTitle}>Foto de Perfil</label>
            <label htmlFor="doctor-photo" className={styles.fileInputLabel}>
              {imageFile ? "Trocar imagem" : "Selecionar imagem"}
            </label>
            <input id="doctor-photo" type="file" accept="image/*" onChange={handleFileChange} className={styles.hiddenInput} />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? "Salvando..." : (initialData ? "Atualizar" : "Criar")}
          </button>
          <button type="button" onClick={onCancel} disabled={isLoading} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </AuthForm>
    </div>
  );
};