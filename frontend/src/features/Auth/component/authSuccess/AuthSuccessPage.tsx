// src/pages/AuthSuccessPage/AuthSuccessPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 4. Importa os estilos
import styles from './AuthSuccessPage.module.scss';
import AuthForm, { type FormField } from '../../../../components/Form/AuthForm';
import { validateCpf, validateCep } from '../../../../shared/utils/validators';
import { useAuthSuccess } from '../../hooks/useAuthSuccess';


/**
 * Página de transição que agora é controlada pelo hook useAuthSuccess.
 */
const AuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 5. CHAMA O HOOK
  const { status, error, handleGoogleFormSubmit, isLoading } =
    useAuthSuccess();

  // 6. Estado local para os campos do formulário Google
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // 7. Lógica de submit para o formulário Google
  const handleSubmitCpfCep = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateCpf(cpf)) {
      setFormError('Por favor, insira um CPF válido.');
      return;
    }
    if (!validateCep(cep)) {
      setFormError('Por favor, insira um CEP válido (8 dígitos).');
      return;
    }

    await handleGoogleFormSubmit({ cpf, cep });
  };

  // 8. Define os campos para o AuthForm genérico
  const formFields: FormField[] = [
    {
      elementType: 'input',
      type: 'tel',
      name: 'cpf',
      label: 'CPF',
      placeholder: '000.000.000-00',
      value: cpf,
      onChange: (val) => setCpf(val as string), // Ajuste para o tipo
      required: true,
      autoComplete: 'off',
    },
    {
      elementType: 'input',
      type: 'tel',
      name: 'cep',
      label: 'CEP',
      placeholder: '00000-000',
      value: cep,
      onChange: (val) => setCep(val as string), // Ajuste para o tipo
      required: true,
      autoComplete: 'off',
    },
  ];

  // --- RENDERIZAÇÃO CONDICIONAL ---

  const renderRedirecting = () => (
    <>
      <svg
        className={styles.successIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
      >
        <circle
          className={styles.successIconCircle}
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <path
          className={styles.successIconCheck}
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
      <h1 className={styles.title}>Logado com sucesso!</h1>
      <p className={styles.subtitle}>Você será redirecionado em breve...</p>
      <div className={styles.spinner}></div>
    </>
  );

  const renderGoogleForm = () => (
    <>
      <h1 className={styles.title}>Quase lá!</h1>
      <p className={styles.subtitle}>
        Percebemos que é seu primeiro login com o Google.
        Por favor, complete seu cadastro:
      </p>
      <AuthForm
        fields={formFields}
        handleSubmit={handleSubmitCpfCep}
        isLoading={isLoading}
        buttonText="Salvar e continuar"
      >
        {formError && <div className={styles.formError}>{formError}</div>}
        {error && <div className={styles.formError}>{error}</div>}
      </AuthForm>
    </>
  );

  const renderError = () => (
    <>
      <h1 className={styles.title}>Ocorreu um erro</h1>
      <p className={`${styles.subtitle} ${styles.apiError}`}>
        {error || 'Não foi possível completar a autenticação.'}
      </p>
      <button onClick={() => navigate('/login')} className={styles.backButton}>
        Voltar para o login
      </button>
    </>
  );

  const renderContent = () => {
    switch (status) {
      case 'google_form':
        return renderGoogleForm();
      case 'redirecting':
        return renderRedirecting();
      case 'error':
        return renderError();
      case 'loading':
      default:
        return <div className={styles.spinner}></div>;
    }
  };

  return (
    <div className={styles.authSuccessPage}>
      <div className={styles.container}>{renderContent()}</div>
    </div>
  );
};

export default AuthSuccessPage;