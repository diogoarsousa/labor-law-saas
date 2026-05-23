"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, FileText } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DocumentGenerator } from "@/components/documents/DocumentGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listarDocumentos } from "@/lib/api/documents";
import { formatDate } from "@/lib/utils";
import type { DocumentoGerado } from "@/lib/api/types";

const estadoBadge: Record<string, "default" | "success" | "navy"> = {
  RASCUNHO: "default",
  REVISTO: "navy",
  APROVADO: "success",
};

const estadoLabel: Record<string, string> = {
  RASCUNHO: "Rascunho",
  REVISTO: "Revisto",
  APROVADO: "Aprovado",
};

const tipoLabel: Record<string, string> = {
  CARTA_DESPEDIMENTO: "Carta de despedimento",
  CONTRATO_TRABALHO: "Contrato de trabalho",
  ACORDO_CESSACAO: "Acordo de cessação",
  AVISO_PREVIO: "Aviso prévio",
  RECIBO_VENCIMENTO: "Recibo de vencimento",
  DECLARACAO_TRABALHO: "Declaração de trabalho",
  REGULAMENTO_INTERNO: "Regulamento interno",
};

export default function DocumentsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["documentos"],
    queryFn: () => listarDocumentos(),
  });

  const documentos = data?.data ?? [];

  return (
    <DashboardShell
      title="Geração de Documentos"
      description="Gere documentos legais com assistência de IA baseada no Código do Trabalho"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator */}
        <div className="lg:col-span-2">
          <DocumentGenerator onGenerated={() => refetch()} />
        </div>

        {/* History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentos gerados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                </div>
              ) : documentos.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-slate-400">
                  <FileText className="mb-2 h-8 w-8" />
                  <p className="text-sm">Nenhum documento gerado</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {documentos.map((doc: DocumentoGerado) => (
                    <li key={doc.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {doc.titulo}
                          </p>
                          <p className="text-xs text-slate-500">
                            {tipoLabel[doc.tipo] ?? doc.tipo}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(doc.criadoEm)}
                          </p>
                        </div>
                        <Badge
                          variant={estadoBadge[doc.estado] ?? "default"}
                          className="shrink-0"
                        >
                          {estadoLabel[doc.estado] ?? doc.estado}
                        </Badge>
                      </div>
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
