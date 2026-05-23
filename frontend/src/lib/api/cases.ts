import apiClient from "./client";
import type {
  Caso,
  CasoCreateRequest,
  CasoUpdateRequest,
  PaginationMeta,
} from "./types";

export interface CasosListResponse {
  data: Caso[];
  meta: PaginationMeta;
}

export async function listarCasos(params?: {
  page?: number;
  size?: number;
  estado?: string;
  tipo?: string;
  search?: string;
}): Promise<CasosListResponse> {
  const response = await apiClient.get<CasosListResponse>("/casos", { params });
  return response.data;
}

export async function buscarCaso(id: string): Promise<Caso> {
  const response = await apiClient.get<{ data: Caso }>(`/casos/${id}`);
  return response.data.data ?? (response.data as unknown as Caso);
}

export async function criarCaso(data: CasoCreateRequest): Promise<Caso> {
  const response = await apiClient.post<{ data: Caso }>("/casos", data);
  return response.data.data ?? (response.data as unknown as Caso);
}

export async function atualizarCaso(
  id: string,
  data: CasoUpdateRequest
): Promise<Caso> {
  const response = await apiClient.put<{ data: Caso }>(`/casos/${id}`, data);
  return response.data.data ?? (response.data as unknown as Caso);
}

export async function eliminarCaso(id: string): Promise<void> {
  await apiClient.delete(`/casos/${id}`);
}
