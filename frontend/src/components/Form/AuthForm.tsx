// components/Form/AuthForm.tsx (Corrigido)

import React from 'react';

import styles from './AuthForm.module.scss';
import { AuthFormProps, FormField } from './types/form.type';

const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  handleSubmit,
  isLoading,
  buttonText,
  children,
}) => {

  const renderField = (field: FormField) => {
    // Props comuns para acessibilidade e controle
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: isLoading || field.disabled,
    };

    // Label padrão (exceto para checkbox que tem layout próprio)
    const labelJsx = field.elementType !== 'checkbox' && (
      <label htmlFor={field.name} className={styles.label}>
        {field.label}
      </label>
    );

    switch (field.elementType) {
      case 'file':
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <div
              className={styles.fileUpload} // Certifique-se de ter esse estilo no CSS do AuthForm
              onClick={() => document.getElementById(field.name)?.click()}
            >
              <input
                {...commonProps}
                type="file"
                hidden
                accept={field.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  field.onChange(file); // Passa o objeto File para o pai
                }}
              />
              
              {/* Lógica de Preview interna do Componente */}
              {field.previewUrl ? (
                <img src={field.previewUrl} alt="Preview" className={styles.preview} />
              ) : (
                <p className={styles.uploadPlaceholder}>
                   {field.placeholder || "Clique para selecionar um arquivo"}
                </p>
              )}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <textarea
              {...commonProps}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        );

      case 'select':
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <select
              {...commonProps}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {field.options.map((option, index) => (
                <option key={`${field.name}-${index}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div className={`${styles.inputGroup} ${styles.checkboxGroup}`} key={field.name}>
            <input
              {...commonProps}
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <label htmlFor={field.name} className={styles.checkboxLabel}>
              {field.label}
            </label>
          </div>
        );

      case 'input':
      default:
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {fields.map(renderField)}
      
      {children}

      <div className={styles.actions}>
        <button type="submit" className={styles.save} disabled={isLoading}>
          {isLoading ? 'Salvando...' : buttonText}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;