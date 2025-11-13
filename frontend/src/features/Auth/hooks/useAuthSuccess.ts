// src/features/Auth/hooks/useAuthSuccess.ts

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateUserByPublicId } from '../services/auth.service'; 
import type { UpdateUserData, UserSession } from '../types/auth.types'; 
import { useAuth } from './useAuth'; 

type AuthStatus = 'loading' | 'redirecting' | 'google_form' | 'error';

export const useAuthSuccess = () => { 
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false); 
  const [googlePublicId, setGooglePublicId] = useState<string | null>(null); 
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, handleGoogleUpdateSuccess } = useAuth(); 

  useEffect(() => {
    // Pega os parâmetros da URL
    const token = searchParams.get('token');
    const publicId = searchParams.get('publicId');
    const isGoogleLogin = searchParams.get('isGoogleLogin') === 'true';
    const needsCompletion = searchParams.get('needsCompletion') === 'true';

    // 1. É LOGIN COM GOOGLE
    if (token && publicId && isGoogleLogin) { 
      
      // 1a. O perfil PRECISA ser completado?
      if (needsCompletion) { // <-- ESTA É A MUDANÇA
        // Sim -> Mostra o formulário para completar o cadastro
        setGooglePublicId(publicId);
        setStatus('google_form'); 
      } else {
        // 1b. Não, perfil está COMPLETO -> Redireciona direto
        setStatus('redirecting'); 
        const timer = setTimeout(() => { 
          navigate('/dashboard'); 
        }, 2000); 
        return () => clearTimeout(timer); 
      }
    }
    // 2. É LOGIN MANUAL
    else {
      if (user?.token) {
        setStatus('redirecting');
        const timer = setTimeout(() => {
          navigate('/dashboard');
       }, 2000);
        return () => clearTimeout(timer);
      } else {
      setError('Sessão inválida ou expirada.'); 
        setStatus('error');
      }
    }
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
      // Chama a API de update (agora 'data' contém os 4 campos)
      const updatedUser: UserSession = await updateUserByPublicId(googlePublicId, data);
      
      // Salva a sessão COMPLETA do Google
     handleGoogleUpdateSuccess(updatedUser); 
      
      setStatus('redirecting'); 
      
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
