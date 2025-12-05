import React from 'react';
import { format } from 'date-fns';

import styles from './_VisualizarDados.module.scss';
import Table from '../../../../components/Tables/Tables';
import { ColumnType } from '../../../../components/Tables/types';
import { getImageUrl } from '../../../../shared/utils/image.utils';
import ProfileCard from '../../components/card/card';
import { UserIcon } from '../../components/icons';
import { UserData } from '../../types/profile.type';


interface VisualizarDadosProps {
  userData: UserData;
}

interface UserTableData {
  propriedade: string;
  valor: string | null;
}

export const _VisualizarDadosPartial: React.FC<VisualizarDadosProps> = ({ userData }) => {

 const imageUrl = getImageUrl(userData.picture);


  // 3. Colunas da Tabela
  const colunas: Array<ColumnType<UserTableData>> = [
    { header: 'Propriedade', accessor: 'propriedade' },
    { header: 'Valor', accessor: 'valor' },
  ];

  // 4. Dados da Tabela
  const dadosParaTabela: UserTableData[] = [
    { propriedade: 'Nome Completo', valor: userData.name },
    { propriedade: 'Email', valor: userData.email },
    { propriedade: 'CEP', valor: userData.cep || 'Não informado' },
    { propriedade: 'Telefone', valor: userData.phone || 'Não informado' },
    {
      propriedade: 'Data de Nascimento',
      valor: userData.birthDate ? format(new Date(userData.birthDate), 'dd/MM/yyyy') : 'Não informado',
    },
    // Exibe apenas o nome do arquivo na tabela (mais limpo que a URL inteira)
    { propriedade: 'Arquivo de Foto', valor: userData.picture || 'Sem foto' },
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <ProfileCard title="Visualizar Dados" icon={<UserIcon />}>
        
        {/* Container da Foto */}
        <div className={styles.profilePictureContainer}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Foto de ${userData.name}`}
              className={styles.profilePicture}
              // Fallback: Se a imagem não carregar (404), esconde ou mostra ícone
              onError={(e) => {
                e.currentTarget.style.display = 'none'; // ou troque o src por um placeholder
                e.currentTarget.parentElement?.classList.add(styles.errorLoading); 
              }}
            />
          ) : (
            // Placeholder padrão se não tiver URL
            <div className={styles.profilePicturePlaceholder}>
              <UserIcon />
            </div>
          )}
          
          {/* Se a imagem quebrou no onError e foi escondida, o placeholder deve aparecer. 
              Isso depende do CSS, mas a lógica acima garante ao menos a tentativa de load. */}
        </div>

        {/* Tabela de Dados */}
        <Table colunas={colunas} dados={dadosParaTabela} />
      </ProfileCard>
    </div>
  );
};