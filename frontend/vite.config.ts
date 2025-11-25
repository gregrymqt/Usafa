import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Importante para resolver caminhos no Windows/Linux

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Define o caminho absoluto para a pasta raiz (onde está o .env)
  // __dirname é a pasta atual (frontend). '..' sobe um nível.
  const envDir = path.resolve(__dirname, '..');

  // 2. Carrega as variáveis manualmente para testar se funcionou
  const env = loadEnv(mode, envDir, '');

  // --- DEBUG ---
  // Olhe no seu terminal (onde roda o npm run dev) se estas mensagens aparecem
  console.log('--------------------------------------------------');
  console.log('🔍 Vite procurando .env em:', envDir);
  console.log('✅ VITE_GENERAL_URL carregada:', env.VITE_GENERAL_URL);
  console.log('--------------------------------------------------');

  return {
    plugins: [react()],
    
    // 3. Diz ao Vite oficialmente: "Sua pasta de envs é a raiz do projeto"
    envDir: envDir,

    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      strictPort: true,
      port: 5173,
    },
    
    // 4. Garante que o código React receba a variável
    define: {
      'import.meta.env.VITE_GENERAL_URL': JSON.stringify(env.VITE_GENERAL_URL),
    }
  };
});