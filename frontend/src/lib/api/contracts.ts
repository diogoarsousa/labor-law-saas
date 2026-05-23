import apiClient from "./client";
import type {
  Contrato,
  ContratoAnalyzeRequest,
  ContratoAnalise,
  PaginationMeta,
} from "./types";

export interface ContratosListResponse {
  data: Contrato[];
  meta: PaginationMeta;
}

export async function listarContratos(params?: {
  page?: number;
  size?: number;
  estado?: string;
}): Promise<ContratosListResponse> {
  const response = await apiClient.get<ContratosListResponse>("/contratos", {
    params,
  });
  return response.data;
}

export async function analisarContrato(
  data: ContratoAnalyzeRequest
): Promise<ContratoAnalise> {
  const response = await apiClient.post<{ data: ContratoAnalise }>(
    "/contratos/analisar",
    data
  );
  return response.data.data ?? (response.data as unknown as ContratoAnalise);
}

export async function carregarContrato(file: File): Promise<Contrato> {
  const formData = new FormData();
  formData.append("ficheiro", file);
  const response = await apiClient.post<{ data: Contrato }>(
    "/contratos/carregar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.data ?? (response.data as unknown as Contrato);
}

export async function buscarContrato(id: string): Promise<Contrato> {
  const response = await apiClient.get<{ data: Contrato }>(`/contratos/${id}`);
  return response.data.data ?? (response.data as unknown as Contrato);
}
