// Conteúdo para: src/utils/validators.ts

/**
 * Valida um endereço de e-mail.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um número de CPF, removendo a máscara.
 */
export const validateCpf = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/[^\d]+/g, ''); // Remove máscara

  if (cpfLimpo.length !== 11) {
    return false;
  }
  // Elimina CPFs inválidos conhecidos (ex: '111.111.111-11')
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  // Validação do 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpfLimpo.charAt(9))) return false;

  // Validação do 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
};

/**
 * Valida um CEP, esperando 8 dígitos (sem máscara).
 */
export const validateCep = (cep: string): boolean => {
  const cepLimpo = cep.replace(/[^\d]+/g, ''); // Remove máscara
  return cepLimpo.length === 8;
};

/**
 * Valida um número de telefone brasileiro (celular ou fixo).
 * Aceita números com ou sem máscara.
 */
export const validatePhone = (phone: string): boolean => {
  const phoneLimpo = phone.replace(/[^\d]+/g, ''); // Remove máscara

  // Deve ter 10 (fixo) ou 11 (celular) dígitos.
  if (phoneLimpo.length < 10 || phoneLimpo.length > 11) {
    return false;
  }

  // Elimina sequências inválidas (ex: '11111111111')
  if (/^(\d)\1{9,10}$/.test(phoneLimpo)) {
    return false;
  }

  return true;
};

/**
 * Retorna um objeto com o estado de validação da senha.
 * Usado para mostrar feedback na UI.
 */
export const getPasswordValidationState = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return { hasMinLength, hasUpperCase, hasNumber, hasSpecialChar };
};

/**
 * Verifica se todos os critérios de validação da senha são verdadeiros.
 */
export const isPasswordValid = (
  validationState: ReturnType<typeof getPasswordValidationState>
): boolean => {
  return Object.values(validationState).every(Boolean);
};