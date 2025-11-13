import React from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.scss';
import AuthForm from '../../../../components/Form/AuthForm';
import type { FormField } from '../../../../components/Form/types/form.type';
import { useRegister } from '../../hooks/useRegister';


// Componente auxiliar movido para fora para maior clareza
const ValidationIndicator: React.FC<{ label: string; isValid: boolean }> = ({ label, isValid }) => (
  <li className={isValid ? styles.valid : styles.invalid}>
    {isValid ? '✓' : '✗'} {label}
  </li>
);

const Register: React.FC = () => {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    cpf,
    setCpf,
    cep,      // <-- ADICIONADO
    setCep,   // <-- ADICIONADO
    phone,
    setPhone,
    birthDate,
    setBirthDate,
    error,
    isLoading,
    passwordValidation,
    handleSubmit,
  } = useRegister();

  // Criar o array de campos para o AuthForm
  const formFields: FormField[] = [
    {
      elementType: 'input',
      name: 'name',
      label: 'Nome',
      type: 'text',
      placeholder: 'Seu nome completo',
      value: name,
      onChange: setName, // OK
      required: true,
      autoComplete: 'name',
    },
    {
      elementType: 'input',
      name: 'cpf',
      label: 'CPF',
      type: 'text',
      placeholder: 'Seu CPF',
      value: cpf,
      onChange: setCpf, // OK
      required: true,
      autoComplete: 'off', 
    },
    {
      elementType: 'input',
      name: 'cep',
      label: 'CEP',
      type: 'text', // Pode ser 'tel' para abrir teclado numérico no celular
      placeholder: 'Seu CEP (só números)',
      value: cep,
      onChange: setCep, // OK
      required: true,
      autoComplete: 'postal-code', 
    },
    {
      elementType: 'input',
      type: 'tel',
      name: 'phone',
      label: 'Telefone',
      placeholder: '(00) 00000-0000',
      value: phone,
      onChange: setPhone,
      required: true,
      autoComplete: 'off',
    },
    {
      elementType: 'input',
      type: 'date', // Tipo 'date' para facilitar a seleção
      name: 'birthDate',
      label: 'Data de Nascimento',
      placeholder: 'DD/MM/AAAA',
      value: birthDate,
      onChange: setBirthDate,
      required: true,
      autoComplete: 'off',
    },
    {
      elementType: 'input',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'seuemail@exemplo.com',
      value: email,
      onChange: setEmail, // OK
      required: true,
      autoComplete: 'email',
    },
    {
      elementType: 'input',
      name: 'password',
      label: 'Senha',
      type: 'password',
      placeholder: 'Sua senha',
      value: password,
      onChange: setPassword, // OK
      required: true,
      autoComplete: 'new-password', 
    },
  ];

  return (
    <div className={styles.registerPage}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Crie sua Conta</h1>
        <p className={styles.subtitle}>É rápido e fácil.</p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <AuthForm
          fields={formFields} // Passando os campos genéricos
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          buttonText="Cadastrar"
        >
          {/* Campo adicional para confirmação de senha */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita sua senha"
              disabled={isLoading}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Indicadores de Validação da Senha */}
          {password.length > 0 && ( // Mostra apenas quando o usuário começa a digitar a senha
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
          Já tem uma conta?{' '}
          <Link to="/login"><strong>Faça login</strong></Link>
        </p>
      </div>
    </div>
  );
};

export default Register;