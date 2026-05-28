import { apiFetch } from "./api/client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
  Utilizador,
} from "./api/types";

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// Decode JWT payload to extract user identity (supports local backend + Keycloak claims)
function decodeUser(accessToken: string): Utilizador | null {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    // Local backend uses firstName/lastName; Keycloak uses given_name/family_name
    const nome =
      [payload.firstName, payload.lastName].filter(Boolean).join(" ") ||
      [payload.given_name, payload.family_name].filter(Boolean).join(" ") ||
      payload.preferred_username ||
      payload.email ||
      "";
    return {
      id: payload.sub ?? "",
      email: payload.email ?? payload.preferred_username ?? "",
      nome,
    };
  } catch {
    return null;
  }
}

export function getUser(): Utilizador | null {
  const token = getToken();
  if (!token) return null;
  return decodeUser(token);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>({
    method: "POST",
    url: "/auth/login",
    data,
  });
  setToken(response.accessToken);
  setRefreshToken(response.refreshToken);
  return response;
}

// Register returns userId+email+message (201). Caller should redirect to /login.
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>({
    method: "POST",
    url: "/auth/register",
    data,
  });
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await apiFetch<void>({
        method: "POST",
        url: "/auth/logout",
        data: { refreshToken },
      });
    }
  } catch {
    // always clear local tokens even if the server call fails
  } finally {
    removeToken();
  }
}

export async function refreshTokens(): Promise<LoginResponse> {
  const refreshToken = getRefreshToken();
  const response = await apiFetch<LoginResponse>({
    method: "POST",
    url: "/auth/refresh",
    data: { refreshToken },
  });
  setToken(response.accessToken);
  setRefreshToken(response.refreshToken);
  return response;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch<void>({
    method: "POST",
    url: "/auth/forgot-password",
    data: { email },
  });
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiFetch<void>({
    method: "POST",
    url: "/auth/change-password",
    data,
  });
}
