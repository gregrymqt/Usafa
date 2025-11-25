// src/shared/hooks/useAuth.ts

import { useNavigate } from "react-router-dom";

// 1. Importe as funções GENÉRICAS do seu api.ts
//    E o mais importante: a CHAVE (KEY) específica.
import {
  getStorageItem,
  setStorageItem,
  logout as apiLogout, // Renomeamos 'logout' para 'apiLogout' para evitar conflito
  USER_STORAGE_KEY     // A chave específica do usuário
} from '../../../shared/services/api.service'; // (Ajuste o caminho se necessário)

// 2. Importe o TIPO (a estrutura do objeto)
import type { UserSession } from '../types/auth.types';

/**
 * Hook global para gerenciar o estado de autenticação.
 * É o ÚNICO lugar que sabe a CHAVE ('USER_STORAGE_KEY') e o 
 * TIPO ('UserSession') do usuário no storage.
 */
export const useAuth = () => {
  const navigate = useNavigate();

  // 1. LÓGICA DE LEITURA (agora vive aqui)
  //    Buscamos o item genérico usando a chave específica
  //    e dizemos que ele é do tipo UserSession.
  const user = getStorageItem<UserSession>(USER_STORAGE_KEY);
  const isAuthenticated = !!user;

  // 2. LÓGICA DE VERIFICAÇÃO DE ROLE (inalterada)
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.includes(role);
  };

  // 3. LÓGICA DE GRAVAÇÃO (Login/Registro)
  //    Recebe o objeto UserSession e o salva usando a chave específica.
  const handleLoginSuccess = (userSession: UserSession) => {
    setStorageItem<UserSession>(USER_STORAGE_KEY, userSession);
    navigate('/logado-com-sucesso'); // Redireciona
  };

  // 4. LÓGICA DE GRAVAÇÃO (Update do Google)
  //    Apenas salva, não redireciona (o hook useAuthSuccess cuida disso).
  const handleGoogleUpdateSuccess = (userSession: UserSession) => {
    setStorageItem<UserSession>(USER_STORAGE_KEY, userSession);
  };

  const updateSessionUser = (updatedData: Partial<UserSession>) => {
    if (user) {
      // Cria um novo objeto mesclando o que já existia (token, roles) com os dados novos
      const newSession = { ...user, ...updatedData };
      setStorageItem<UserSession>(USER_STORAGE_KEY, newSession);
      
      // Dica: Em aplicações maiores, aqui você dispararia um evento para atualizar o contexto
      // Mas para recarregar a tela simples, o React vai gerenciar via estado do hook local
    }
  };

  // 5. LÓGICA DE LOGOUT
  //    Apenas chama a função 'logout' do api.ts.
  //    Essa função (apiLogout) já é completa:
  //    - Chama a API /auth/logout
  //    - Remove o item (usando removeStorageItem(USER_STORAGE_KEY))
  //    - Redireciona para /login
  const handleLogout = async () => {
    await apiLogout();
  };

  // 6. Retorna as funções e dados para a aplicação
return {
    user,
    isAuthenticated,
    hasRole,
    handleLoginSuccess,
    handleGoogleUpdateSuccess, // Pode remover se usar o updateSessionUser, são parecidos
    updateSessionUser, // <--- EXPOR A NOVA FUNÇÃO
    handleLogout
  };
};