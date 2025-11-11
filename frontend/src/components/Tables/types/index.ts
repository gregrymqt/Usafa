// src/components/Tables/types/index.ts
export interface ColumnType<T> {
  header: string;
  accessor: keyof T;
}

export type TableDataType<T> = T[];
