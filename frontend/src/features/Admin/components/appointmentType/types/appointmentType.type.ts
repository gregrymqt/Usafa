export interface TipoConsulta {
  id: number;
  publicId: string;
  nome: string;
}

// Interface auxiliar para os dados que vão para a Tabela
// Como sua Tabela é genérica, precisamos passar o ActionMenu como um ReactNode dentro do objeto
export interface TipoConsultaTableData {
  nome: string;
  acoes: React.ReactNode; 
}