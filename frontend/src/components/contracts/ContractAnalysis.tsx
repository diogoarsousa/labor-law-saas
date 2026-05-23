import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ContratoAnalise } from "@/lib/api/types";

const gravidadeBadge: Record<
  string,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  BAIXA: "info",
  MEDIA: "warning",
  ALTA: "danger",
  CRITICA: "danger",
};

const gravidadeLabel: Record<string, string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

interface ContractAnalysisProps {
  /** Analysis result from the backend */
  analise: ContratoAnalise;
}

/**
 * Displays the results of an AI contract analysis including
 * risk score, legal violations, recommendations, and citations.
 */
export function ContractAnalysis({ analise }: ContractAnalysisProps) {
  const riskColor =
    analise.pontuacaoRisco >= 70
      ? "text-red-600"
      : analise.pontuacaoRisco >= 40
      ? "text-amber-600"
      : "text-emerald-600";

  const riskLabel =
    analise.pontuacaoRisco >= 70
      ? "Risco elevado"
      : analise.pontuacaoRisco >= 40
      ? "Risco moderado"
      : "Baixo risco";

  return (
    <div className="space-y-6">
      {/* Risk score + Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`text-5xl font-bold ${riskColor}`}>
              {analise.pontuacaoRisco}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{riskLabel}</p>
              <p className="text-xs text-slate-500">
                {analise.violacoes.length} violação(ões) detectada(s)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sumário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed font-legal">
              {analise.sumario}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violations */}
      {analise.violacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Violações detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {analise.violacoes.map((v, i) => (
                <li key={i} className="rounded-md border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-900">
                          {v.artigo}
                        </span>
                        <Badge variant={gravidadeBadge[v.gravidade]}>
                          {gravidadeLabel[v.gravidade]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {v.descricao}
                      </p>
                      {v.sugestao && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                          <p className="text-xs text-blue-700">{v.sugestao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analise.recomendacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analise.recomendacoes.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Legal articles */}
      {analise.artigosRelevantes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Artigos aplicáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-slate-100">
              {analise.artigosRelevantes.map((art, i) => (
                <li key={i} className="py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-indigo-600 shrink-0 pt-0.5">
                      {art.artigo}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {art.diploma}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 font-legal">
                        {art.texto}
                      </p>
                      {art.url && (
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 text-xs text-indigo-600 hover:underline"
                        >
                          Ver diploma completo
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
