// components/Profile/ProfileUpdateForm.tsx (Novo)

import React, { useState, useEffect } from 'react';
import { type UserData } from '../types';
import AuthForm from '../../../components/Form/AuthForm';
import { type UserProfileUpdateDTO } from '../hooks/userHook';
import type { InputField } from '../../../components/Form/types/form.type';

interface ProfileUpdateFormProps {
  // O usuário atual, vindo do hook
  user: UserData; 
  // A função de update, vinda do hook
  onUpdate: (data: UserProfileUpdateDTO) => Promise<boolean>; 
  // O estado de loading, vindo do hook
  isUpdating: boolean; 
  // O erro de update, vindo do hook
  updateError: string | null; 
}

export const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({ 
  user, 
  onUpdate, 
  isUpdating, 
  updateError 
}) => {

  // 1. Estado local do formulário
  // Inicializamos com os dados do usuário que vieram do hook
  const [name, setName] = useState(user.nome);
  const [cep, setCep] = useState(user.cep);
  const [picture, setPicture] = useState(user.picture || '');

  // 2. Sincronização
  // Se os dados do 'user' (do hook) mudarem (ex: após um save),
  // atualizamos o estado local do formulário.
  useEffect(() => {
    setName(user.nome);
    setCep(user.cep);
    setPicture(user.picture || '');
  }, [user]);

  // 3. Definição dos campos para o AuthForm
  const formFields: InputField[] = [
    {
      elementType: 'input',
      name: 'name',
      label: 'Nome Completo',
      type: 'text',
      placeholder: 'Seu nome',
      value: name,
      onChange: setName,
      required: true,
      autoComplete: 'name',
    },
    {
      elementType: 'input',
      name: 'cep',
      label: 'CEP',
      type: 'text', // Pode ser 'tel'
      placeholder: 'Seu CEP',
      value: cep,
      onChange: setCep,
      required: true,
      autoComplete: 'postal-code',
    },
    {
      elementType: 'input',
      name: 'picture',
      label: 'URL da Foto de Perfil',
      type: 'text',
      placeholder: 'https://exemplo.com/sua-foto.png',
      value: picture,
      onChange: setPicture,
      required: false,
      autoComplete: 'photo',
    }
  ];

  // 4. Submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Chama a função 'onUpdate' (que é o 'handleUpdateProfile' do hook)
    await onUpdate({ name, cep, picture }); 
  };

  return (
    <div>
      {/* Mostra erros específicos do update */}
      {updateError && (
        <p style={{ color: 'red', marginBottom: '10px' }}>
          {updateError}
        </p>
      )}

      <AuthForm
        fields={formFields}
        handleSubmit={handleSubmit}
        isLoading={isUpdating} // Usamos o 'isUpdating'
        buttonText="Salvar Alterações"
      />
    </div>
  );
};