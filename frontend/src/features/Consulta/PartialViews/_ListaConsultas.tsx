import React from 'react';
import { ConsultaList } from '../components/table/listConsulta'; // 
import type { Consulta } from '../types/consulta.types'; // (Assumindo que o tipo existe)

interface ListaConsultasProps {
  consultas: Consulta[];
  isLoading: boolean;
}

export const _ListaConsultasPartial: React.FC<ListaConsultasProps> = ({
  consultas,
  isLoading,
}) => {
  return (
    <div>
      <h2>Suas Consultas Agendadas</h2>
      <ConsultaList
        consultas={consultas}
        isLoading={isLoading}
      />
    </div>
  );
};