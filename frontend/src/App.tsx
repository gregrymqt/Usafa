// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// --- Seus Guardiões ---
import AdminProtectedRoute from './features/Auth/routes/AdminProtectedRoute.tsx';
import UserProtectedRoute from './features/Auth/routes/UserProtectedRoute.tsx';

// --- Páginas de Erro ---
import UnauthorizedPage from './pages/UnauthorizedPage';

// --- Páginas Principais ---
import Layout from './components/Layout';
import Home from './pages/Home.tsx';
import Profile from './features/Profile/Profile.tsx';
import Consulta from './pages/Consulta.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';


// --- IMPORTE AS PÁGINAS DE AUTH AQUI DIRETAMENTE ---
import AuthSuccessPage from './features/Auth/component/authSuccess/AuthSuccessPage.tsx';
import Register from './features/Auth/component/register/RegisterPage.tsx';
import Login from './pages/Login.tsx';
import CreatePasswordPage from './features/Auth/component/CreatePassword/CreatePasswordPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================== */}
        {/* 1. ROTAS DE AUTENTICAÇÃO (FORA DO LAYOUT PRINCIPAL)  */}
        {/* ==================================================== */}
        
        {/* Coloque os <Route> diretamente aqui, filhos de <Routes> */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logado-com-sucesso" element={<AuthSuccessPage />} />
        <Route path="/auth/callback" element={<AuthSuccessPage />} />
        <Route path="/definir-senha" element={<CreatePasswordPage />} />
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />


        {/* ==================================================== */}
        {/* 2. ROTAS DENTRO DO LAYOUT (NAVBAR, FOOTER, ETC)      */}
        {/* ==================================================== */}
        <Route element={<Layout />}>
          
          <Route path="/" element={<Home />} />

          {/* Rotas PROTEGIDAS (ROLE_USER) */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/mconsulta" element={<Consulta />} /> 
          </Route>

          {/* Rotas ADMIN (ROLE_ADMIN) */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;