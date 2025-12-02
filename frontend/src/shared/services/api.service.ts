import type { UserSession } from '../../features/Auth/types/auth.types';
import { ApiError } from '../exceptions/ApiError';
import type { ApiErrorResponse } from '../exceptions/types/ApiErrorResponse';

// --- 1. Configuração Central ---
// IMPORTANTE: Garanta que sua variável no .env é VITE_GENERAL_URL ou VITE_API_URL
// Se no .env está VITE_GENERAL_URL, mude aqui para usar ela.
const API_BASE_URL = import.meta.env.VITE_GENERAL_URL || 'http://localhost:8080/api/v1';

export const USER_STORAGE_KEY = 'seu-app-User-token';

// --- 2. Funções Auxiliares (IGUAIS AO SEU) ---
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

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout', {});
  } catch (error) {
    console.error('[API Logout] Falha ao invalidar token no backend:', error);
  } finally {
    removeStorageItem(USER_STORAGE_KEY);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
};

// --- 3. O Wrapper "apiFetch" (CORRIGIDO) ---
const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  
  const session = getStorageItem<UserSession>(USER_STORAGE_KEY);
  const token = session?.token || null;

  // --- CORREÇÃO AQUI ---
  // Começamos apenas com os headers que são comuns a todos
  const defaultHeaders: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true' 
  };

  // Só adicionamos 'application/json' se o body NÃO for FormData.
  // Se for FormData, deixamos o navegador decidir o Content-Type (para incluir o boundary).
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  // ---------------------

  const mergedHeaders = new Headers({
    ...defaultHeaders,
    ...(options.headers || {}),
  });

  if (token && !mergedHeaders.has('Authorization')) {
    mergedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); 

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Ignora erro de parse
      }

      if (errorData && errorData.message) {
        throw ApiError.fromResponse(errorData);
      } else {
        throw new ApiError(
          `Erro ${response.status}: ${response.statusText}`,
          response.status
        );
      }
    }

    if (response.status === 204) {
      return null as T;
    }
    return (await response.json()) as T;

  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          console.warn('[API 401] Token expirado ou inválido. Deslogando...');
          handleLogoutInternal(); 
          break;
        case 403:
          console.error('[API 403] Acesso negado.');
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

// --- 4. Exportação (IGUAL) ---
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

  postFormData: <T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> => {
    // Removemos o Content-Type para o browser setar o boundary do multipart automaticamente
    const headers = { ...(options.headers || {}) };
    // @ts-expect-error
    delete headers['Content-Type'];

    return apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: headers,
    });
  },

  putFormData: <T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> => {
      const headers = { ...(options.headers || {}) };
      // @ts-expect-error
      delete headers['Content-Type'];
  
      return apiFetch<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: formData,
        headers: headers,
      });
    },
};



export default api;