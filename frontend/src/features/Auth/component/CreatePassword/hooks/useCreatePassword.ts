import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserByPublicId, createPassword } from '../../../services/auth.service';
import type { UserSession } from '../../../types/auth.types';
import { getPasswordValidationState } from '../../../../../shared/utils/validators.utils';


export const useCreatePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estado para os dados do usuário e senhas
  const [user, setUser] = useState<UserSession | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estado de UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const publicId = searchParams.get('id');

  useEffect(() => {
    if (!publicId) {
      setError('ID de usuário inválido ou não fornecido.');
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getUserByPublicId(publicId);
        if (!userData.createdByAdmin) {
          setError('Este usuário não foi criado por um administrador e não pode usar esta página.');
        } else {
          setUser(userData);
        }
      } catch (err) {
        console.error(err);
        setError('Não foi possível encontrar o usuário. O link pode ter expirado.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [publicId]);

  useEffect(() => {
    setPasswordValidation(getPasswordValidationState(password));
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!publicId || !user) return;

    setIsLoading(true);
    try {
      await createPassword({ publicId, password });
      alert('Senha criada com sucesso! Você será redirecionado para o login.');
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro desconhecido ao criar a senha.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    passwordValidation,
    handleSubmit,
  };
};