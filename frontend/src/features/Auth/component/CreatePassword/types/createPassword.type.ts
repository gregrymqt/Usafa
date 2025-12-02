export interface UpdateUserAndCreatePasswordData {
  newPassword: string;
  publicId: string;
}

export interface ValidateTokenResponse {
  token: string;      // O JWT gerado [cite: 62]
  publicId: string;
  name: string;
  email: string;
  cep: string;
  phone: string;
  birthDate: string;
  picture?: string;   // Opcional, pois pode vir nulo do Java
  roles: string[];    // Lista de roles 
}