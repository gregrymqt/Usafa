import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss'; // Reutilizando os estilos
import AuthForm from '../../../../components/Form/AuthForm';
import type { FormField } from '../../../../components/Form/types/form.type';
import { useCreatePassword } from '../../hooks/useCreatePassword';

// Componente auxiliar para os indicadores de validação de senha
const ValidationIndicator: React.FC<{ label: string; isValid: boolean }> = ({ label, isValid }) => (
  <li className={isValid ? styles.valid : styles.invalid}>
    {isValid ? '✓' : '✗'} {label}
  </li>
);

const CreatePasswordPage: React.FC = () => {
  const {
    user,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    passwordValidation,
    handleSubmit,
  } = useCreatePassword();

  // Campos do formulário para definir a senha
  const formFields: FormField[] = [
    {
      elementType: 'input',
      name: 'password',
      label: 'Nova Senha',
      type: 'password',
      placeholder: 'Crie sua senha de acesso',
      value: password,
      onChange: setPassword,
      required: true,
      autoComplete: 'new-password',
    },
  ];

  if (isLoading && !user) {
    return <div className={styles.registerPage}><p>Carregando...</p></div>;
  }

  return (
    <div className={styles.registerPage}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Olá, {user?.name}!</h1>
        <p className={styles.subtitle}>Crie uma senha para finalizar seu cadastro.</p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <AuthForm
          fields={formFields}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          buttonText="Salvar Senha"
        >
          {/* Campo adicional para confirmação de senha */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua nova senha"
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Indicadores de Validação da Senha */}
          {password.length > 0 && (
            <div className={styles.validationBox}>
              <p>Sua senha deve conter:</p>
              <ul>
                <ValidationIndicator label="Pelo menos 8 caracteres" isValid={passwordValidation.hasMinLength} />
                <ValidationIndicator label="Uma letra maiúscula" isValid={passwordValidation.hasUpperCase} />
                <ValidationIndicator label="Um número" isValid={passwordValidation.hasNumber} />
                <ValidationIndicator label="Um caractere especial (!@#...)" isValid={passwordValidation.hasSpecialChar} />
              </ul>
            </div>
          )}
        </AuthForm>

        <p className={styles.loginLink}>
          Já tem uma senha?{' '}
          <Link to="/login"><strong>Faça login</strong></Link>
        </p>
      </div>
    </div>
  );
};

export default CreatePasswordPage;