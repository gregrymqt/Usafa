// Seu hook refatorado (ex: src/hooks/useRegister.ts)

import { useState, useMemo } from 'react';
import { register } from '../services/auth.service';
// 1. Importa os validadores do novo arquivo
import {
  validateEmail,
  validateCpf,
  validateCep,
  getPasswordValidationState,
  isPasswordValid as checkPasswordValidity,
  validatePhone, // Renomeado para evitar conflito
} from '../../../shared/utils/validators';
import type { UserSession } from '../types/auth.types';
import { useAuth } from './useAuth';

export const useRegister = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleLoginSuccess } = useAuth();

  // --- Validação da Senha (agora usa a função do utils) ---
  const passwordValidation = useMemo(() => {
    // 2. A lógica de validação saiu daqui
    return getPasswordValidationState(password);
  }, [password]);

  // 3. A lógica de verificação também saiu
  const isPasswordValid = checkPasswordValidity(passwordValidation);

  // --- LÓGICA DE VALIDAÇÃO REMOVIDA DE DENTRO DO SUBMIT ---

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // --- 4. Chamando as funções de validação centralizadas ---
    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    if (!validateCpf(cpf)) {
      setError('Por favor, insira um CPF válido.');
      return;
    }

    if (!validateCep(cep)) {
      setError('Por favor, insira um CEP válido com 8 dígitos.');
      return;
    }

    if (!isPasswordValid) {
      setError('A senha não atende a todos os critérios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if(!validatePhone(phone)){
      setError('Por favor, insira um telefone válido.');
      return;
    }

    if(!birthDate){
      setError('Por favor, insira uma data de nascimento válida.');
      return;
    }

    setIsLoading(true);
    try {
      // 5. Envia o CEP e os outros dados para a API
      //    E AGORA ESPERAMOS A RESPOSTA (UserSession)
      const response: UserSession = await register({
        name,
        email,
        password,
        cpf,
        cep,
        phone,
        birthDate,
      });

      handleLoginSuccess(response);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
    cep,
    setCep,
    phone,
    setPhone,
    birthDate,
    setBirthDate,
    error,
    isLoading,
    passwordValidation, // Mantido para a UI
    handleSubmit,
  };
};