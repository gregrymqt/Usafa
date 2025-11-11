// src/features/auth/authRoutes.tsx

import { Route } from 'react-router-dom';
import AuthSuccessPage from '../component/authSuccess/AuthSuccessPage';
import Login from '..';
import Register from '../component/register';

// 1. Importe os 3 componentes de autenticação.
// (Estou assumindo os caminhos com base no seu App.tsx. Ajuste se necessário)

/**
 * Este componente agrupa todas as rotas de autenticação
 * que ficam FORA do layout principal (sem navbar, sem sidebar, etc.)
 */
const AuthRoutes = () => (
  <>
    {/* Rota de Login (que você já tinha) */}
    <Route path="/login" element={<Login />} />
    
    {/* Nova rota de Registro */}
    <Route path="/register" element={<Register />} />

    {/* Nossas duas rotas de "sucesso" que apontam para o MESMO componente */}
    <Route path="/logado-com-sucesso" element={<AuthSuccessPage />} />
    <Route path="/auth/callback" element={<AuthSuccessPage />} />
  </>
);

export default AuthRoutes;