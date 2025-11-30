import React from "react";
import styles from "./HomeForm.module.scss";
import { HomeContent, CONTENT_TYPES } from "../../types/homeAdmin.type";
import { useHomeAdmin } from "../../hooks/useHomeAdmin";

interface HomeFormProps {
  initialData?: HomeContent | null;
  onSubmit: (data: Partial<HomeContent>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const HomeForm: React.FC<HomeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    formData,
    previewUrl,
    handleInputChange,
    handleFileChange,
    handleSubmit,
  } = useHomeAdmin({ initialData, onSubmit });

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label>Tipo de Conteúdo</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          disabled={isLoading}
        >
          {CONTENT_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>Imagem (Banner/Destaque)</label>
        <div
          className={styles.fileUpload}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className={styles.preview} />
          ) : (
            <p style={{ color: "#9ca3af" }}>
              Clique para fazer upload da imagem
            </p>
          )}
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Título</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Ex: Promoção de Verão"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Texto descritivo..."
          disabled={isLoading}
        />
      </div>

      <div
        className={styles.inputGroup}
        style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}
      >
        <input
          type="checkbox"
          name="isActive"
          checked={!!formData.isActive} // Garante que o valor seja booleano
          onChange={handleInputChange}
          disabled={isLoading}
          id="activeCheck"
        />
        <label htmlFor="activeCheck" style={{ marginBottom: 0 }}>
          Visível no Site?
        </label>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type="submit" className={styles.save} disabled={isLoading}>
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default HomeForm;
