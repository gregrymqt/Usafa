// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// --- Nossos Guardiões ---
import AdminProtectedRoute from './features/Auth/routes/AdminProtectedRoute.tsx';
import UserProtectedRoute from './features/Auth/routes/UserProtectedRoute.tsx';


// --- Nossas Rotas de Auth (públicas) ---
import UnauthorizedPage from './pages/UnauthorizedPage';

// --- Nossas Páginas ---
import Layout from './components/Layout';
import Home from './pages/Home.tsx';
import Profile from './features/Profile/index.tsx';
import AuthRoutes from './features/Auth/routes/authRoutes.tsx';
import Consulta from './pages/Consulta.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rotas PÚBLICAS (Login, Register, /auth/callback, etc.) */}
        <Route element={<AuthRoutes />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 2. Rotas DENTRO DO LAYOUT */}
        <Route element={<Layout />}>
          
          {/* Rota pública principal */}
          <Route path="/" element={<Home />} />

          {/* 3. Rotas que exigem apenas ROLE_USER */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/mconsulta" element={<Consulta />} /> 
          </Route>

          {/* 4. Rotas que exigem ROLE_ADMIN */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* <Route path="/admin/gerenciar-usuarios" element={<GerenciarUsuarios />} /> */}
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;