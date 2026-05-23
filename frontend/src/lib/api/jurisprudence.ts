import apiClient from "./client";
import type {
  Jurisprudencia,
  JurisprudenciaSearchRequest,
  PaginationMeta,
} from "./types";

export interface JurisprudenciaListResponse {
  data: Jurisprudencia[];
  meta: PaginationMeta;
}

export async function pesquisarJurisprudencia(
  params: JurisprudenciaSearchRequest
): Promise<JurisprudenciaListResponse> {
  const response = await apiClient.get<JurisprudenciaListResponse>(
    "/jurisprudencia/pesquisar",
    { params }
  );
  return response.data;
}

export async function buscarJurisprudencia(
  id: string
): Promise<Jurisprudencia> {
  const response = await apiClient.get<{ data: Jurisprudencia }>(
    `/jurisprudencia/${id}`
  );
  return response.data.data ?? (response.data as unknown as Jurisprudencia);
}
