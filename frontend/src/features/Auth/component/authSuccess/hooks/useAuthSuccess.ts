// src/features/Auth/hooks/useAuthSuccess.ts

import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updateUserByPublicId } from "../../../services/auth.service";
import type { UpdateUserData, UserSession } from "../../../types/auth.types";
import { useAuth } from "../../../hooks/useAuth";

type AuthStatus = "loading" | "redirecting" | "google_form" | "error";

export const useAuthSuccess = () => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googlePublicId, setGooglePublicId] = useState<string | null>(null);
  const tempToken = useRef<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, handleGoogleUpdateSuccess } = useAuth();

  const getRedirectPath = (roles: string[]): string => {
    return roles.includes("ROLE_ADMIN") ? "/admin" : "/profile";
  };

  useEffect(() => {
    const token = searchParams.get("token");
    const publicId = searchParams.get("publicId");
    const isGoogleLogin = searchParams.get("isGoogleLogin") === "true";
    const needsCompletion = searchParams.get("needsCompletion") === "true";
    const rolesParam = searchParams.get("roles")?.split(",") ?? [];

    // Decodifica URI components caso venham com %20 (espaços)
    const nameParam = decodeURIComponent(searchParams.get("name") || "Usuário");
    const emailParam = decodeURIComponent(searchParams.get("email") || "");
    const pictureParam = decodeURIComponent(searchParams.get("picture") || "");

    // 1. É LOGIN COM GOOGLE
    if (token && publicId && isGoogleLogin) {
      if (needsCompletion) {
        tempToken.current = token;
        setGooglePublicId(publicId);
        setStatus("google_form");
      } else {
        // 1b. Perfil COMPLETO

        // Montamos o objeto de sessão com os dados REAIS vindos do Java
        const sessionData = {
          token: token,
          publicId: publicId,
          roles: rolesParam,
          name: nameParam, // Agora temos o nome real!
          email: emailParam, // Agora temos o email real!
          avatar: pictureParam, // Se seu UserSession tiver campo de foto/avatar
          isAuthenticated: true,
        };

        // Atualiza o contexto global
        // @ts-expect-error: The sessionData might not perfectly match UserSession due to missing fields like 'id' or 'refreshToken' which are not always present in the initial Google login flow.
        handleGoogleUpdateSuccess(sessionData);

        setStatus("redirecting");

        const redirectPath = getRedirectPath(rolesParam);
        const timer = setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    // 2. É LOGIN MANUAL
    else {
      if (user?.token) {
        setStatus("redirecting");
        const redirectPath = getRedirectPath(user.roles);
        const timer = setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setError("Sessão inválida ou expirada.");
        setStatus("error");
      }
    }
  }, [searchParams, navigate, user, handleGoogleUpdateSuccess]);
  /**
   * Função chamada pelo formulário de CPF/CEP.
   */
  const handleGoogleFormSubmit = async (data: UpdateUserData) => {
    if (!googlePublicId) {
      setError("ID de usuário não encontrado.");
      setStatus("error");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenToSend = tempToken.current || searchParams.get("token");

      // Chama a API de update (agora 'data' contém os 4 campos)
      const updatedUser: UserSession = await updateUserByPublicId(
        googlePublicId,
        data,
        tokenToSend ?? ""
      );

      // Salva a sessão COMPLETA do Google
      handleGoogleUpdateSuccess(updatedUser);

      setStatus("redirecting");
      const redirectPath = getRedirectPath(updatedUser.roles);
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Não foi possível salvar seus dados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { status, error, isLoading, handleGoogleFormSubmit };
};
