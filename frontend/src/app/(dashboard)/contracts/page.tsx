"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Upload } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractUpload } from "@/components/contracts/ContractUpload";
import { ContractAnalysis } from "@/components/contracts/ContractAnalysis";
import { carregarContrato, listarContratos } from "@/lib/api/contracts";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { Contrato, ContratoAnalise } from "@/lib/api/types";

const estadoBadge: Record<
  string,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  PENDENTE: "warning",
  ANALISADO: "info",
  APROVADO: "success",
  REJEITADO: "danger",
};

const estadoLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  ANALISADO: "Analisado",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
};

export default function ContractsPage() {
  const [analise, setAnalise] = useState<ContratoAnalise | null>(null);
  const [analisadoNome, setAnalisadoNome] = useState<string>("");

  const { data, isLoading: listLoading } = useQuery({
    queryKey: ["contratos"],
    queryFn: () => listarContratos(),
  });

  const uploadMutation = useMutation({
    mutationFn: carregarContrato,
    onSuccess: (contrato) => {
      if (contrato.analise) {
        setAnalise(contrato.analise);
        setAnalisadoNome(contrato.nome);
      }
      toast({ title: "Contrato carregado e analisado com sucesso." });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao analisar contrato",
        description: "Não foi possível processar o ficheiro. Tente novamente.",
      });
    },
  });

  const contratos = data?.data ?? [];

  return (
    <DashboardShell
      title="Análise de Contratos"
      description="Carregue contratos de trabalho para verificar a conformidade legal"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upload + Analysis column */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-indigo-600" />
                Carregar contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContractUpload
                onFileSelected={(file) => {
                  setAnalise(null);
                  uploadMutation.mutate(file);
                }}
                isLoading={uploadMutation.isPending}
              />
            </CardContent>
          </Card>

          {uploadMutation.isPending && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm">A analisar contrato com IA...</p>
            </div>
          )}

          {analise && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                Resultado da análise — {analisadoNome}
              </h2>
              <ContractAnalysis analise={analise} />
            </div>
          )}
        </div>

        {/* History column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {listLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                </div>
              ) : contratos.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <FileText className="mb-2 h-8 w-8" />
                  <p className="text-sm">Sem contratos anteriores</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {contratos.map((c: Contrato) => (
                    <li key={c.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {c.nome}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDateTime(c.criadoEm)}
                          </p>
                        </div>
                        <Badge variant={estadoBadge[c.estado]} className="shrink-0">
                          {estadoLabel[c.estado]}
                        </Badge>
                      </div>
                      {c.analise && (
                        <div className="mt-1 flex items-center gap-2">
                          <div
                            className={`text-xs font-semibold ${
                              c.analise.pontuacaoRisco >= 70
                                ? "text-red-600"
                                : c.analise.pontuacaoRisco >= 40
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            Risco: {c.analise.pontuacaoRisco}/100
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {c.analise.violacoes.length} violação(ões)
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
