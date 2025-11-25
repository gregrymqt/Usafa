// src/features/AdminDashboard/PartialViews/_Profile.tsx
import React from 'react';
import styles from './_Profile.module.scss';
import { useAuth } from '../../../../features/Auth/hooks/useAuth'; // Ajuste para seu hook de Auth
import type { ColumnType } from '../../../../components/Tables/types'; // Ajuste imports
import Table from '../../../../components/Tables/Tables';
import { ProfileRowData } from './types/profile.type';


export const ProfilePartial: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className={styles.profileContainer}>Carregando perfil...</div>;
  }

  // 1. Definição das Colunas para o componente genérico Table
  const columns: ColumnType<ProfileRowData>[] = [
    { header: 'Informação', accessor: 'campo' },
    { header: 'Detalhe', accessor: 'valor' },
  ];

  // 2. Transforma o UserSession em linhas para a tabela
  // Formatamos booleanos e arrays para strings legíveis
  const data: ProfileRowData[] = [
    { campo: 'Nome Completo', valor: user.name },
    { campo: 'E-mail', valor: user.email },
    { campo: 'Telefone', valor: user.phone || '-' },
    { campo: 'Data de Nascimento', valor: user.birthDate || '-' },
    { campo: 'CEP', valor: user.cep || '-' },
    { 
      campo: 'Permissões (Roles)', 
      valor: user.roles.map(r => r.replace('ROLE_', '')).join(', ') 
    },
    { 
      campo: 'ID Público', 
      valor: <span title={user.publicId}>{user.publicId.substring(0, 8)}...</span> 
    },
    { 
      campo: 'Criado por Admin', 
      valor: user.createdByAdmin ? 'Sim' : 'Não' 
    },
  ];

  return (
    <div className={styles.profileContainer}>
      <h2>Meus Dados</h2>
      
      <div className={styles.infoCard}>
        {/* Usando seu componente genérico de Tabela */}
        <Table<ProfileRowData> 
          colunas={columns} 
          dados={data} 
        />
      </div>
    </div>
  );
};