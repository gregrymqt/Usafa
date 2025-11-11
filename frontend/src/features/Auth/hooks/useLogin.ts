import { useState } from 'react';
import type { LoginCredentials, UserSession } from '../types/auth.types';
import { login } from '../services/auth.service';
import { validateEmail } from '../../../shared/utils/validators'; // Só precisamos deste validador
import { useAuth } from './useAuth';

export const useLogin= () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleLoginSuccess } = useAuth();

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    if (!validateEmail(credentials.email) || !credentials.password) {
       setError('Email ou senha inválidos.');
       setIsLoading(false);
       return;
    }

    try {
      // 3. Chama o serviço de API
      //    Assume que `login` retorna o ResponseDTO { token, publicId }
      const response: UserSession = await login(credentials);

     handleLoginSuccess(response);

    } catch (err) {
      // 6. Define uma mensagem de erro para a UI
      setError('Email ou senha inválidos. Tente novamente.');
      console.error('Falha no login:', err);
    } finally {
      // 7. Garante que o estado de loading seja desativado
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
    window.location.href = googleLoginUrl;
  };

  return { isLoading, error, handleLogin, handleGoogleLogin };
};