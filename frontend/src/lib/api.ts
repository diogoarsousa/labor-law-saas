const BASE = "http://localhost:8080/api/v1/doutor-trabalho";

// ── Types ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CitationDto {
  lawNumber: string;
  article: string;
  articleText: string;
  sourceUrl: string;
  corpusType: string;
}

export interface LegalAnswerResponse {
  sessionId: string;
  exchangeId: string;
  question: string;
  answer: string;
  citations: CitationDto[];
  metadata: { tokensInput: number; tokensOutput: number; latencyMs: number; timestamp: string };
}

export interface SessionSummaryResponse {
  id: string;
  title: string;
  exchangeCount: number;
  createdAt: string;
  updatedAt: string;
  exchanges: LegalAnswerResponse[] | null;
}

// ── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dt_access_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Backend ApiResponse envelope: { errors: [{ code, message, field }] }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      const messages = (body.errors as { message: string; field?: string }[])
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join("\n");
      throw new Error(messages);
    }
    throw new Error(body.message ?? body.error ?? `Erro ${res.status}`);
  }

  const body = await res.json();
  // Backend wraps everything in { success, data, message }
  return ("data" in body ? body.data : body) as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (firstName: string, lastName: string, email: string, password: string, organizationName?: string) =>
    apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password, organizationName }),
    }),

  refresh: (refreshToken: string) =>
    apiFetch<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (refreshToken: string) =>
    apiFetch<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

// ── Legal Q&A ────────────────────────────────────────────────────────────────

export const legalQa = {
  ask: (sessionId: string | null, question: string) =>
    apiFetch<LegalAnswerResponse>("/legal-qa/ask", {
      method: "POST",
      body: JSON.stringify({ sessionId, question }),
    }),

  listSessions: () =>
    apiFetch<SessionSummaryResponse[]>("/legal-qa/sessions"),

  getSession: (sessionId: string) =>
    apiFetch<SessionSummaryResponse>(`/legal-qa/sessions/${sessionId}`),

  renameSession: (sessionId: string, title: string) =>
    apiFetch<void>(`/legal-qa/sessions/${sessionId}?title=${encodeURIComponent(title)}`, {
      method: "PATCH",
    }),

  deleteSession: (sessionId: string) =>
    apiFetch<void>(`/legal-qa/sessions/${sessionId}`, { method: "DELETE" }),
};
