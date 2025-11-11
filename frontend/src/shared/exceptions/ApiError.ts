import type { ApiErrorResponse } from "./types/ApiErrorResponse";

/**
 * Classe de Erro personalizada do Front-end.
 * Ela "envolve" o erro vindo da API, guardando a
 * mensagem e o status HTTP.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly originalMessage: string; // Mensagem vinda da API

  constructor(message: string, status: number = 500) {
    // 'super(message)' chama o construtor da classe 'Error'
    super(message);

    // Garante que o nome da classe seja 'ApiError'
    this.name = 'ApiError';
    this.status = status;
    this.originalMessage = message;

    // Restaura o 'prototype chain'
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Método estático para criar um ApiError a partir de
   * uma resposta de erro do back-end.
   */
  static fromResponse(errorData: ApiErrorResponse): ApiError {
    return new ApiError(errorData.message, errorData.status);
  }
}