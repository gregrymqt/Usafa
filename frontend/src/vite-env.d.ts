/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly VITE_GENERAL_URL: string;
  // adicione outras variáveis aqui se precisar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}