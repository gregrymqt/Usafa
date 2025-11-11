// src/features/Auth/hooks/useAuthSuccess.ts

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateUserByPublicId } from '../services/auth.service';
import type { UpdateUserData, UserSession } from '../types/auth.types';
import { useAuth } from './useAuth'; // (Caminho assumido)

type AuthStatus = 'loading' | 'redirecting' | 'google_form' | 'error';

export const useAuthSuccess = () => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googlePublicId, setGooglePublicId] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Chame useAuth() UMA VEZ AQUI, no nível superior.
  //    Pegue TUDO que precisamos dele: o 'user' e as 'funções'.
  const { user, handleGoogleUpdateSuccess } = useAuth();

  useEffect(() => {
    // Pega os parâmetros da URL
    const token = searchParams.get('token');
    const publicId = searchParams.get('publicId');
    const isGoogleLogin = searchParams.get('isGoogleLogin') === 'true';

    // 1. É LOGIN COM GOOGLE
    if (token && publicId && isGoogleLogin) {
      // (Sua lógica de 'google_form' está correta)
      setGooglePublicId(publicId);
      setStatus('google_form');
    }
    // 2. É LOGIN MANUAL
    else {
      // 2. Use o 'user' que pegamos lá em cima.
      //    Não chame useAuth() de novo!
      //    O hook 'useAuth' já leu o localStorage para nós.
      if (user?.token) { // 'user' é o 'manualUser'
        setStatus('redirecting');
        const timer = setTimeout(() => {
          navigate('/dashboard');
        }, 2000); // 2 segundos
        return () => clearTimeout(timer);
      } else {
        // Se chegou aqui, o login manual falhou em salvar
        // ou o usuário acessou a URL /logado-com-sucesso direto.
        setError('Sessão inválida ou expirada.');
        setStatus('error');
      }
    }
  // 3. Adicione 'user' às dependências do useEffect.
  //    Isso garante que o useEffect re-execute se o estado de auth mudar.
  }, [searchParams, navigate, user]);

  /**
   * Função chamada pelo formulário de CPF/CEP.
   */
  const handleGoogleFormSubmit = async (data: UpdateUserData) => {
    if (!googlePublicId) {
      setError('ID de usuário não encontrado.');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Chama a API de update
      const updatedUser: UserSession = await updateUserByPublicId(googlePublicId, data);

      // SUCESSO!
      // Salva a sessão COMPLETA do Google (agora com CPF/CEP)
      handleGoogleUpdateSuccess(updatedUser);

      // Muda o status para "redirecting" para mostrar a animação de sucesso
      setStatus('redirecting');

      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível salvar seus dados.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { status, error, isLoading, handleGoogleFormSubmit };
};