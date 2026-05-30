import { useEffect, useState } from "react";
import type { LoginResponse } from "./api";

const ACCESS_KEY = "dt_access_token";
const REFRESH_KEY = "dt_refresh_token";

// ── Storage helpers ───────────────────────────────────────────────────────────

export function saveTokens(data: LoginResponse) {
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
  listeners.forEach((fn) => fn());
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  listeners.forEach((fn) => fn());
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

// ── Reactive hook ─────────────────────────────────────────────────────────────

const listeners = new Set<() => void>();

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => isAuthenticated());

  useEffect(() => {
    const update = () => setLoggedIn(isAuthenticated());
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  return { loggedIn };
}
