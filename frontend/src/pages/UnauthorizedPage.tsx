// src/pages/UnauthorizedPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link to="/">Voltar para a Home</Link>
    </div>
  );
};

export default UnauthorizedPage;