import apiClient from "./client";
import type {
  DocumentoGerado,
  DocumentoGenerateRequest,
  PaginationMeta,
} from "./types";

export interface DocumentosListResponse {
  data: DocumentoGerado[];
  meta: PaginationMeta;
}

export async function listarDocumentos(params?: {
  page?: number;
  size?: number;
  tipo?: string;
}): Promise<DocumentosListResponse> {
  const response = await apiClient.get<DocumentosListResponse>("/documentos", {
    params,
  });
  return response.data;
}

export async function gerarDocumento(
  data: DocumentoGenerateRequest
): Promise<DocumentoGerado> {
  const response = await apiClient.post<{ data: DocumentoGerado }>(
    "/documentos/gerar",
    data
  );
  return response.data.data ?? (response.data as unknown as DocumentoGerado);
}

export async function buscarDocumento(id: string): Promise<DocumentoGerado> {
  const response = await apiClient.get<{ data: DocumentoGerado }>(
    `/documentos/${id}`
  );
  return response.data.data ?? (response.data as unknown as DocumentoGerado);
}

export async function exportarDocumento(
  id: string,
  formato: "PDF" | "DOCX"
): Promise<Blob> {
  const response = await apiClient.get(`/documentos/${id}/exportar`, {
    params: { formato },
    responseType: "blob",
  });
  return response.data as Blob;
}
