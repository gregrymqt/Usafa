// Login.tsx (Corrigido)

import React, { useState } from 'react';
import { useLogin } from './hooks/useLogin';
import styles from './styles.module.scss';
import { Link } from 'react-router-dom';

// 1. Importe o 'AuthForm' e o tipo 'InputField'
//    (O seu script estava importando 'GenericForm', mas o componente se chama 'AuthForm')
import AuthForm, { type InputField } from './../../components/Form/AuthForm'; 

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { isLoading, error, handleLogin, handleGoogleLogin } = useLogin();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    handleLogin({ email, password });
  };

  // 2. Defina a configuração dos campos usando o tipo 'InputField[]'
  const loginFields: InputField[] = [
    {
      elementType: 'input',
      type: 'email',
      name: 'email',
      label: 'Email',
      placeholder: 'seuemail@exemplo.com',
      value: email,
      onChange: setEmail, // OK (string => string)
      required: true,
      autoComplete: 'email',
      disabled: isLoading,
    },
    {
      elementType: 'input',
      type: 'password',
      name: 'password',
      label: 'Senha',
      placeholder: 'Sua senha',
      value: password,
      onChange: setPassword, // OK (string => string)
      required: true,
      autoComplete: 'current-password',
      disabled: isLoading,
    }
  ];

  return (
    <div className={styles.loginPage}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Bem-vindo!</h1>
        <p className={styles.subtitle}>Acesse sua conta para continuar</p>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* 3. Use o componente 'AuthForm' (em vez de 'GenericForm') */}
        <AuthForm
          fields={loginFields}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          buttonText="Entrar"
        />
        {/* Fim do formulário genérico */}

        <div className={styles.separator}>
          <span>ou</span>
        </div>

        <button onClick={handleGoogleLogin} className={styles.googleButton} disabled={isLoading}>
          <span className={styles.googleIcon}>G</span> Entrar com Google
        </button>
        <p className={styles.loginLink}>
          Caso não tenha uma conta?{' '}
          <Link to="/register"><strong>Cadastre-se</strong></Link> 
        </p>
      </div>
    </div>
  );
};

export default Login;