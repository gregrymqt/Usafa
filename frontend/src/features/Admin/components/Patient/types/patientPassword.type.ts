/**
 * @interface GeneratePasswordTokenRequest
 * Corresponde ao DTO `PasswordCreationTokenRequestDto` do backend.
 * Usado para solicitar a geração de um novo token.
 */
export interface GeneratePasswordTokenRequest {
  userPublicId: string;
}

/**
 * @interface PasswordTokenResponse
 * Corresponde ao DTO `PasswordCreationTokenResponseDto` do backend.
 * Representa a resposta da API ao gerar ou buscar um token.
 */
export interface PasswordTokenResponse {
  url: string;
  expiryDate: string; // Datas são recebidas como strings no formato ISO 8601
}