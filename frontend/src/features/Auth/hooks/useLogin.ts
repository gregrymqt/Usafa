import { useState } from "react";
import Swal from "sweetalert2";
import type { LoginCredentials, UserSession } from "../types/auth.types";
import { login } from "../services/auth.service";
import { validateEmail } from "../../../shared/utils/validators.utils"; // Só precisamos deste validador
import { useAuth } from "./useAuth";
import { ApiError } from "../../../shared";

export const useLogin = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleLoginSuccess } = useAuth();

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    if (!validateEmail(credentials.email) || !credentials.password) {
      const errorMessage = "Email e senha são obrigatórios.";
      setError(errorMessage);
      Swal.fire("Campos inválidos", errorMessage, "warning");
      setIsLoading(false);
      return;
    }

    try {
      const response: UserSession = await login(credentials);
      handleLoginSuccess(response);
    } catch (error: unknown) {
      console.error("Falha no login:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Email ou senha inválidos. Tente novamente.";

      setError(errorMessage);
      Swal.fire("Falha no Login", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Agora buscando VITE_GENERAL_URL
    const googleLoginUrl = `${
      import.meta.env.VITE_GENERAL_URL
    }/oauth2/authorization/google`;

    console.log("URL Gerada:", googleLoginUrl); // Debug para confirmar
    window.location.href = googleLoginUrl;
  };

  return { isLoading, error, handleLogin, handleGoogleLogin };
};
