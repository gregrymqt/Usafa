export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  cep: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 

export interface UserSession{
  token: string,
  publicId: string,
  name: string,
  email: string,
  cep: string,
  roles: string[]
}

export interface UpdateUserData {  
  cep: string;
  cpf: string;
}

export interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}



