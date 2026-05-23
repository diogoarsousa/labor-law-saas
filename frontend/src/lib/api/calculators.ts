import apiClient from "./client";
import type {
  CalculoIndemnizacaoRequest,
  CalculoIndemnizacaoResponse,
  CalculoSalarioRequest,
  CalculoSalarioResponse,
} from "./types";

export async function calcularIndemnizacao(
  data: CalculoIndemnizacaoRequest
): Promise<CalculoIndemnizacaoResponse> {
  const response = await apiClient.post<{ data: CalculoIndemnizacaoResponse }>(
    "/calculadoras/indemnizacao",
    data
  );
  return (
    response.data.data ?? (response.data as unknown as CalculoIndemnizacaoResponse)
  );
}

export async function calcularSalario(
  data: CalculoSalarioRequest
): Promise<CalculoSalarioResponse> {
  const response = await apiClient.post<{ data: CalculoSalarioResponse }>(
    "/calculadoras/salario",
    data
  );
  return (
    response.data.data ?? (response.data as unknown as CalculoSalarioResponse)
  );
}
