import { useState, useEffect } from 'react';
import type { UserData, UserProfileUpdateDTO } from '../types/profile.type';
import { updateUserData } from '../services/profile.service';
import { ApiError } from '../../../shared';
import { useAuth } from '../../Auth/hooks/useAuth';

export const useUserProfileData = () => {
  const { user, updateSessionUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData | null>(() => {
    if (!user) return null;

    return {
      email: user.email,
      cep: user.cep,
      nome: user.name,
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
                nome: user.name,
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
        if (prev.nome === user.name && prev.cep === user.cep && prev.email === user.email) {
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
      const updatedUserApi = await updateUserData(updateData);
      
      setUserData(updatedUserApi);

      updateSessionUser({
        name: updatedUserApi.nome,
        cep: updatedUserApi.cep,
      });
      
      return true; 
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Erro ao atualizar.';
      setUpdateError(errorMsg);
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