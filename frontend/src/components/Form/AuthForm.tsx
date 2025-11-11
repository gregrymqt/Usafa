// components/Form/AuthForm.tsx (Corrigido)

import React from 'react';
import styles from './AuthForm.module.scss'; // Assumindo que o CSS module está aqui
import type { AuthFormProps, FormField } from './types/form.type';

const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  handleSubmit,
  isLoading,
  buttonText,
  children,
}) => {

  const renderField = (field: FormField) => {
    
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      disabled: isLoading || field.disabled,
      autoComplete: field.autoComplete,
    };

    const labelJsx = field.elementType !== 'checkbox' && (
      <label htmlFor={field.name} className={styles.label}>
        {field.label}
      </label>
    );

    switch (field.elementType) {
      case 'textarea':
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <textarea
              {...commonProps}
              placeholder={field.placeholder}
              value={field.value} // OK: value é string
              onChange={(e) => field.onChange(e.target.value)} // OK: onChange espera string
            />
          </div>
        );

      case 'select':
        return (
          <div className={styles.inputGroup} key={field.name}>
            {labelJsx}
            <select
              {...commonProps}
              value={field.value} // OK: value é string|number
              onChange={(e) => field.onChange(e.target.value)}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className={styles.checkboxGroup} key={field.name}>
            <input
              {...commonProps}
              type="checkbox"
              // CORREÇÃO: Usamos 'checked', não 'value'
              checked={field.value} // OK: value é boolean
              // CORREÇÃO: Passamos o 'e.target.checked' (boolean)
              onChange={(e) => field.onChange(e.target.checked)} // OK: onChange espera boolean
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
              // CORREÇÃO: O 'value' agora é 100% compatível (só string)
              value={field.value} // OK: value é string
              onChange={(e) => field.onChange(e.target.value)} // OK: onChange espera string
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {fields.map(renderField)}
      {children}
      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Aguarde...' : buttonText}
      </button>
    </form>
  );
};

export default AuthForm;