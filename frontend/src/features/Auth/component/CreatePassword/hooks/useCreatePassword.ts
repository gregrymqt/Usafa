import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { UserSession } from '../../../types/auth.types';
import { getPasswordValidationState } from '../../../../../shared/utils/validators.utils';
import { passwordTokenService } from '../services/passwordToken.service';


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

  const tokenUrl = searchParams.get('id');

  useEffect(() => {
    if (!tokenUrl) {
      setError('ID de usuário inválido ou não fornecido.');
      setIsLoading(false);
      return;
    }

   const fetchUser = async () => {
        try {
            setIsLoading(true);
            // Chama a service nova
            const userData = await passwordTokenService.validateTokenAndGetUser(tokenUrl);
            
            // userData agora tem a tipagem correta (ValidateTokenResponse)
            console.log("Usuário validado:", userData.name);
            setUser({
              ...userData,
              // A resposta da validação do token não inclui 'createdByAdmin', então definimos um valor padrão.
              createdByAdmin: true, 
            }); 

        } catch (error) {
            console.error("Token inválido", error);
            setError("Link expirado ou inválido");
        } finally {
            setIsLoading(false);
        }
    };

    fetchUser();
}, [tokenUrl]);

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
    if (!user || !user.publicId) return;

    setIsLoading(true);
    try {
      await passwordTokenService.createPassword({ publicId: user.publicId,  newPassword: password });
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