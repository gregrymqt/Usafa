import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Define o caminho absoluto para a pasta raiz (onde está o .env)
  const envDir = path.resolve(__dirname, '..');

  // 2. Carrega as variáveis manualmente para logar no terminal (Debug)
  const env = loadEnv(mode, envDir, '');

  console.log('--------------------------------------------------');
  console.log('🔍 Vite procurando .env em:', envDir);
  console.log('✅ VITE_GENERAL_URL carregada:', env.VITE_GENERAL_URL);
  console.log('--------------------------------------------------');

  return {
    plugins: [react()],
    
    // Diz ao Vite onde buscar o .env oficialmente
    envDir: envDir,

    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 5173,
    },
    
    // Garante a injeção da variável (Fallback de segurança)
    define: {
      'import.meta.env.VITE_GENERAL_URL': JSON.stringify(env.VITE_GENERAL_URL),
    },

    // --- CORREÇÃO DO AVISO DE CHUNK SIZE ---
    build: {
      // Aumenta o limite do aviso para 1000kb (1MB) para não poluir o terminal
      chunkSizeWarningLimit: 1000, 
      
      rollupOptions: {
        output: {
          // Separa bibliotecas (node_modules) do seu código principal
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});