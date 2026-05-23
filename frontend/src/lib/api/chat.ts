import apiClient from "./client";
import type { ChatRequest, ChatResponse, ChatMensagem } from "./types";

export async function enviarMensagem(data: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>("/chat", data);
  return response.data;
}

export async function buscarHistoricoSessao(
  sessaoId: string
): Promise<ChatMensagem[]> {
  const response = await apiClient.get<{ data: ChatMensagem[] }>(
    `/chat/sessoes/${sessaoId}/mensagens`
  );
  return response.data.data ?? (response.data as unknown as ChatMensagem[]);
}

export async function listarSessoes(): Promise<
  { id: string; titulo: string; criadoEm: string }[]
> {
  const response = await apiClient.get<{
    data: { id: string; titulo: string; criadoEm: string }[];
  }>("/chat/sessoes");
  return response.data.data ?? (response.data as unknown as []);
}
