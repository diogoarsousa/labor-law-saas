import apiClient from "./client";
import type { DashboardStats } from "./types";

export async function buscarEstatisticas(): Promise<DashboardStats> {
  const response = await apiClient.get<{ data: DashboardStats }>(
    "/dashboard/estatisticas"
  );
  return response.data.data ?? (response.data as unknown as DashboardStats);
}
