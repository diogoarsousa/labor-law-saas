import { apiFetch } from "./client";
import type {
  LegalQuestionRequest,
  LegalAnswerResponse,
  SessionSummary,
  ChatMensagem,
} from "./types";

export async function enviarMensagem(
  data: LegalQuestionRequest
): Promise<LegalAnswerResponse> {
  return apiFetch<LegalAnswerResponse>({
    method: "POST",
    url: "/legal-qa/ask",
    data,
  });
}

export async function listarSessoes(): Promise<SessionSummary[]> {
  return apiFetch<SessionSummary[]>({ method: "GET", url: "/legal-qa/sessions" });
}

export async function buscarHistoricoSessao(
  sessaoId: string
): Promise<ChatMensagem[]> {
  const session = await apiFetch<SessionSummary>({
    method: "GET",
    url: `/legal-qa/sessions/${sessaoId}`,
  });
  return exchangesToMessages(session);
}

export async function renomearSessao(
  sessaoId: string,
  title: string
): Promise<void> {
  return apiFetch<void>({
    method: "PATCH",
    url: `/legal-qa/sessions/${sessaoId}`,
    params: { title },
  });
}

export async function eliminarSessao(sessaoId: string): Promise<void> {
  return apiFetch<void>({
    method: "DELETE",
    url: `/legal-qa/sessions/${sessaoId}`,
  });
}

/** Convert a session's exchanges into a flat ChatMensagem array for the UI. */
export function exchangesToMessages(session: SessionSummary): ChatMensagem[] {
  if (!session.exchanges?.length) return [];
  return session.exchanges.flatMap((ex) => [
    {
      id: `${ex.exchangeId}-q`,
      sessaoId: session.id,
      papel: "UTILIZADOR" as const,
      conteudo: ex.question,
      criadoEm: ex.metadata?.timestamp ?? session.createdAt,
    },
    {
      id: ex.exchangeId,
      sessaoId: session.id,
      papel: "ASSISTENTE" as const,
      conteudo: ex.answer,
      citacoes: ex.citations,
      criadoEm: ex.metadata?.timestamp ?? session.createdAt,
    },
  ]);
}
