import type { UserSession } from '../../features/Auth/types/auth.types';
import { ApiError} from '../exceptions/ApiError'; // 1. IMPORTA O NOVO ApiError
import type { ApiErrorResponse } from '../exceptions/types/ApiErrorResponse';

// --- 1. Configuração Central ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
export const USER_STORAGE_KEY = 'seu-app-User-token';


// --- 2. Funções Auxiliares de Autenticação ---
export const getStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  return item ? (JSON.parse(item) as T) : null;
};

export const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeStorageItem = (key: string): void => {
  localStorage.removeItem(key);
};

const handleLogoutInternal = () => {
  removeStorageItem(USER_STORAGE_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * 1. Chama o backend para adicionar o token à blocklist.
 * 2. Limpa os dados locais (mesmo se a chamada falhar).
 */
export const logout = async (): Promise<void> => {
  try {
    // 1. Tenta invalidar o token no backend.
    // O 'api.post' vai automaticamente incluir o token no header
    // (porque o 'apiFetch' o adiciona)
    await api.post('/auth/logout', {}); // Envia requisição para a blocklist
    
  } catch (error) {
    // Mesmo se falhar (ex: offline), o 'finally' vai deslogar localmente
    console.error('[API Logout] Falha ao invalidar token no backend:', error);
  } finally {
    // 2. Limpa a sessão local e redireciona
    removeStorageItem(USER_STORAGE_KEY);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// --- 3. O Wrapper "apiFetch" (Modificado) ---
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  
  // --- Lógica do "Request Interceptor" ---
  const token = getStorageItem<UserSession>(USER_STORAGE_KEY)?.token || null;
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const mergedHeaders = new Headers({
    ...defaultHeaders,
    ...(options.headers || {}),
  });
  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`);
  }
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

  // --- Lógica do "Response Interceptor" ---
  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 8. TRATAMENTO DE ERRO (MODIFICADO)
    if (!response.ok) {
      // Tenta extrair o corpo do erro (ex: { "message": "...", "status": 400 })
      let errorData: ApiErrorResponse | null = null;
      try {
        errorData = await response.json();
      } catch {
        // O corpo do erro não é JSON ou está vazio
      }

      // 2. LANÇA A NOVA CLASSE ApiError
      if (errorData && errorData.message) {
        // Se o back-end enviou um erro estruturado
        throw ApiError.fromResponse(errorData);
      } else {
        // Se foi um erro genérico (ex: 500 sem corpo)
        throw new ApiError(
          `Erro ${response.status}: ${response.statusText}`,
          response.status
        );
      }
    }

    // 9. Resposta de Sucesso (Status 2xx)
    if (response.status === 204) {
      return null as T;
    }
    return (await response.json()) as T;

  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // --- Tratamento Global de Erros (MODIFICADO) ---

    // 3. VERIFICA SE É UMA INSTÂNCIA DO ApiError (agora com type assertion)
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          console.warn('[API 401] Token expirado ou inválido. Deslogando...');
          // 3. Chama o logout INTERNO (não precisa chamar a API de novo)
          handleLogoutInternal(); 
          break;
        case 403:
          console.error('[API 403] Acesso negado. Você não tem permissão.');
          break;
        case 500:
        case 502:
        case 503:
          console.error(`[API ${error.status}] Erro interno do servidor.`);
          break;
      }
    } else if (error instanceof Error) {
      console.error('[API Fetch] Erro de Rede ou Timeout:', error.message);
    } else {
      console.error('[API Fetch] Erro inesperado:', error);
    }

    throw error;
  }
};

// --- 4. Exportação ---
// (Sem alterações, mas removi os comentários "CORREÇÃO")
export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return apiFetch<T>(endpoint, { ...options, method: 'GET' });
  },

  post: <T>(endpoint: string, body: unknown, options: RequestInit = {}): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put: <T>(endpoint: string, body: unknown, options: RequestInit = {}): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return apiFetch<T>(endpoint, { ...options, method: 'DELETE' });
  },
  
  patch: <T>(endpoint: string, body: unknown, options: RequestInit = {}): Promise<T> => {
    return apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};

export default api;