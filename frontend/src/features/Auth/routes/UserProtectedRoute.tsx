// src/components/Auth/UserProtectedRoute.tsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UserProtectedRoute = () => {
  // 1. Pega o status de autenticação E a função de checar role
  const { isAuthenticated, hasRole } = useAuth();

  // 2. Checagem 1: Está logado?
  if (!isAuthenticated) {
    // Se não estiver logado, expulsa para /login
    return <Navigate to="/login" replace />;
  }

  // 3. Checagem 2: É um usuário comum?
  if (!hasRole('ROLE_USER')) {
    // Se está logado, MAS não tem a role de USER (ex: é só admin, ou algo deu errado)
    // Expulsa para uma página de "Acesso Negado"
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Passou nas duas checagens: Renderiza a página
  return <Outlet />;
};

export default UserProtectedRoute;