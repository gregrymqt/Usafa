import React from 'react';
import ProfileCard from '../../components/card/card';
import { UserIcon } from '../../components/icons';
import styles from './_VisualizarDados.module.scss'; // Importando o SCSS
import { type UserData } from '../../types/profile.type';
import { format } from 'date-fns';
import Table from '../../../../components/Tables/Tables'; // 1. Importar o componente de Tabela
import { type ColumnType } from '../../../../components/Tables/types'; // 2. Importar o tipo das colunas

interface VisualizarDadosProps {
  userData: UserData;
}

// Interface para o objeto de dados que a tabela irá renderizar
interface UserTableData {
  propriedade: string;
  valor: string | null;
}

export const _VisualizarDadosPartial: React.FC<VisualizarDadosProps> = ({ userData }) => {
  // 3. Definir as colunas da tabela
  const colunas: Array<ColumnType<UserTableData>> = [
    { header: 'Propriedade', accessor: 'propriedade' },
    { header: 'Valor', accessor: 'valor' },
  ];

  // 4. Transformar os dados do usuário no formato que a tabela espera
  const dadosParaTabela: UserTableData[] = [
    { propriedade: 'Nome Completo', valor: userData.nome }, // Corrigido: usar userData.nome
    { propriedade: 'Email', valor: userData.email },
    { propriedade: 'CEP', valor: userData.cep || 'Não informado' },
    { propriedade: 'Telefone', valor: userData.phone || 'Não informado' },
    {
      propriedade: 'Data de Nascimento',
      valor: userData.birthDate ? format(new Date(userData.birthDate), 'dd/MM/yyyy') : 'Não informado', // Corrigido: sintaxe do ternário
    },
    { propriedade: 'URL da Foto', valor: userData.picture || 'Não informada' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <ProfileCard title="Visualizar Dados" icon={<UserIcon />}>
        {/* Adiciona a visualização da foto de perfil */}
        <div className={styles.profilePictureContainer}>
          {userData.picture ? (
            <img
              src={userData.picture}
              alt="Foto de Perfil"
              className={styles.profilePicture}
            />
          ) : (
            <div className={styles.profilePicturePlaceholder}>
              <UserIcon />
            </div>
          )}
        </div>
        {/* 5. Renderizar o componente de Tabela genérico */}
        <Table colunas={colunas} dados={dadosParaTabela} />
      </ProfileCard>
    </div>
  );
};