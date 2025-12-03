import React, { useState, useEffect, useMemo } from "react";

import styles from "./ProfileUpdateForm.module.scss"; // Se tiver estilos
import AuthForm from "../../../../components/Form/AuthForm";
import { FormField } from "../../../../components/Form/types/form.type";
 import { ProfileUpdateFormProps } from "../../types/profile.type";

export const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({
  user,
  onUpdate,
  isUpdating,
  updateError,
}) => {
  const [name, setName] = useState(user.name);
  const [cep, setCep] = useState(user.cep);

  // Novo estado para o arquivo e preview
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState(user.picture || "");

  // Sincronização
  useEffect(() => {
    setName(user.name);
    setCep(user.cep);
    // Se não tivermos selecionado um arquivo novo, mantemos a foto atual do user
    if (!imageFile) {
      setPreviewUrl(user.picture || "");
    }
  }, [user, imageFile]);

  // Handler de Arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Cria preview local
    }
  };

  // Submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Envia o arquivo junto com os dados
    await onUpdate({ name, cep, imageFile });
  };

  // Campos de Texto (O AuthForm cuida do visual destes)
  const formFields: FormField[] = useMemo(
    () => [
      {
        elementType: "input",
        name: "name",
        label: "Nome Completo",
        type: "text",
        value: name,
        onChange: (val: string) => setName(val),
        required: true,
        placeholder: "Seu nome completo",
      },
      {
        elementType: "input",
        name: "cep",
        label: "CEP",
        type: "text",
        value: cep,
        onChange: (val: string) => setCep(val),
        placeholder: "00000-000",
        required: true,
      },
    ],
    [name, cep]
  );

  return (
    <div className={styles.container}>
      {updateError && <div className={styles.errorMessage}>{updateError}</div>}

      <AuthForm
        fields={formFields}
        handleSubmit={handleSubmit}
        isLoading={isUpdating}
        buttonText="Salvar Alterações"
        actionsClassName={styles.actions}
      >
        {/* Seção de Upload de Foto, agora seguindo a estrutura do SCSS */}
        <div className={styles.photoUploadSection}>
          <div className={styles.previewContainer}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholder}>👤</div>
            )}
          </div>
          <div className={styles.uploadControls}>
            <label>Sua Foto</label>
            <label htmlFor="file-upload" className={styles.fileLabelBtn}>
              Trocar foto
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              // O input real fica escondido, a interação é via label
            />
          </div>
        </div>
      </AuthForm>
    </div>
  );
};
