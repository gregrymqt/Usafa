import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type { UserData, UserProfileUpdateDTO } from '../types/profile.type';
import { updateUserData } from '../services/profile.service';
import { useAuth } from '../../Auth/hooks/useAuth';
import { ApiError } from '../../../shared';

export const useUserProfileData = () => {
  const { user, updateSessionUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData | null>(() => {
    if (!user) return null;

    return {
      email: user.email,
      cep: user.cep,
      name: user.name,
      cpf: 'Não informado',
      cartaoSus: '',
      endereco: '',
      picture: '',
      proximasConsultas: [],
      consultasAnteriores: [],
      publicId: user.publicId,
      birthDate: user.birthDate,
      phone: user.phone,
    } as UserData;
  });

  // CORREÇÃO AQUI:
  useEffect(() => {
    if (user) {
      setUserData(prev => {
        // Se não houver estado anterior (ex: login inicial), retorna o objeto novo
        if (!prev) {
            // Aqui você poderia recriar o objeto inicial se necessário, 
            // ou deixar o fluxo seguir se garantir que prev existe.
            // Assumindo que se user existe, prev deveria existir pela lógica inicial,
            // mas por segurança:
             return {
                email: user.email,
                cep: user.cep,
                name: user.name,
                cpf: 'Não informado',
                cartaoSus: '',
                endereco: '',
                picture: '',
                proximasConsultas: [],
                consultasAnteriores: [],
                publicId: user.publicId,
                birthDate: user.birthDate,
                phone: user.phone,
             } as UserData;
        }

        // Se os dados essenciais não mudaram, não faz nada (evita loop)
        if (prev.name === user.name && prev.cep === user.cep && prev.email === user.email) {
          return prev;
        }

        // Se mudou algo, atualiza
        return {
          ...prev,
          nome: user.name,
          cep: user.cep,
          email: user.email
        };
      });
    }
  }, [user?.name, user?.cep, user?.email]); // Dependências Primitivas

 const handleUpdateProfile = async (updateData: UserProfileUpdateDTO) => {
    setUpdateError(null);
    setIsUpdating(true);
    try {
      // Chama a função atualizada que usa FormData
      const updatedUserApi = await updateUserData(updateData);
      
      setUserData(updatedUserApi);

      // Atualiza sessão global (se necessário)
      updateSessionUser({
        name: updatedUserApi.name,
        cep: updatedUserApi.cep,
        picture: updatedUserApi.picture // Se quiser atualizar a foto no header/sessão
      });

      Swal.fire('Sucesso!', 'Seu perfil foi atualizado.', 'success');
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Ocorreu um erro inesperado ao atualizar o perfil.";

      setUpdateError(errorMessage);
      Swal.fire('Erro ao Atualizar', errorMessage, 'error');

      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { 
    userData, 
    isUpdating, 
    updateError, 
    handleUpdateProfile
  };
};