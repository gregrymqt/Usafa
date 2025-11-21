import React from 'react';
import { ConsultaList } from '../components/table/listConsulta'; 
import type { Consulta } from '../types/consulta.types';

// CORREÇÃO 1: Adicionar as propriedades obrigatórias na interface de entrada
interface ListaConsultasProps {
  consultas: Consulta[];
  isLoading: boolean;
  hasMore: boolean;      // <-- Novo
  loadMore: () => void;  // <-- Novo
}

export const ListaConsultasPartial: React.FC<ListaConsultasProps> = ({
  consultas,
  isLoading,
  hasMore,  // <-- Recebe aqui
  loadMore, // <-- Recebe aqui
}) => {
  return (
    <div>
      <h2>Suas Consultas Agendadas</h2>
      <ConsultaList
        consultas={consultas}
        isLoading={isLoading}
        // CORREÇÃO 2: Repassar as propriedades para o componente filho
        hasMore={hasMore} 
        loadMore={loadMore}
      />
    </div>
  );
};