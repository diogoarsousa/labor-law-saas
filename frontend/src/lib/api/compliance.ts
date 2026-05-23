import apiClient from "./client";
import type {
  ComplianceCheckRequest,
  ComplianceResultado,
  PaginationMeta,
} from "./types";

export interface ComplianceListResponse {
  data: ComplianceResultado[];
  meta: PaginationMeta;
}

export async function verificarConformidade(
  data: ComplianceCheckRequest
): Promise<ComplianceResultado> {
  const response = await apiClient.post<{ data: ComplianceResultado }>(
    "/conformidade/verificar",
    data
  );
  return (
    response.data.data ?? (response.data as unknown as ComplianceResultado)
  );
}

export async function listarVerificacoes(params?: {
  page?: number;
  size?: number;
}): Promise<ComplianceListResponse> {
  const response = await apiClient.get<ComplianceListResponse>(
    "/conformidade",
    { params }
  );
  return response.data;
}
