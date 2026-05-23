import apiClient from "./client";
import type { AlteracaoLegislativa, PaginationMeta } from "./types";

export interface MonitoringListResponse {
  data: AlteracaoLegislativa[];
  meta: PaginationMeta;
}

export async function listarAlteracoes(params?: {
  page?: number;
  size?: number;
  lida?: boolean;
  impacto?: string;
}): Promise<MonitoringListResponse> {
  const response = await apiClient.get<MonitoringListResponse>(
    "/monitorizacao/alteracoes",
    { params }
  );
  return response.data;
}

export async function marcarComoLida(id: string): Promise<void> {
  await apiClient.patch(`/monitorizacao/alteracoes/${id}/lida`);
}

export async function marcarTodasComoLidas(): Promise<void> {
  await apiClient.patch("/monitorizacao/alteracoes/marcar-todas-lidas");
}
