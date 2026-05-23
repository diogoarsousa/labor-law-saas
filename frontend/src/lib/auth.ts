import apiClient from "./api/client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Utilizador,
} from "./api/types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): Utilizador | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Utilizador;
  } catch {
    return null;
  }
}

export function setUser(user: Utilizador): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<{ data: AuthResponse }>(
    "/auth/login",
    data
  );
  const auth = response.data.data ?? (response.data as unknown as AuthResponse);
  setToken(auth.token);
  setUser(auth.utilizador);
  return auth;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<{ data: AuthResponse }>(
    "/auth/register",
    data
  );
  const auth = response.data.data ?? (response.data as unknown as AuthResponse);
  setToken(auth.token);
  setUser(auth.utilizador);
  return auth;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore errors on logout
  } finally {
    removeToken();
  }
}
