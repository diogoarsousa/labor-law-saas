"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listarAlteracoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from "@/lib/api/monitoring";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { AlteracaoLegislativa } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const impactoBadge: Record<
  string,
  "default" | "info" | "success" | "warning" | "danger"
> = {
  BAIXO: "info",
  MEDIO: "warning",
  ALTO: "danger",
  CRITICO: "danger",
};

const impactoLabel: Record<string, string> = {
  BAIXO: "Baixo impacto",
  MEDIO: "Médio impacto",
  ALTO: "Alto impacto",
  CRITICO: "Impacto crítico",
};

const tipoLabel: Record<string, string> = {
  LEI: "Lei",
  DECRETO_LEI: "Decreto-Lei",
  PORTARIA: "Portaria",
  DESPACHO: "Despacho",
  ACORDO: "Acordo",
};

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const [lidaFilter, setLidaFilter] = useState<string>("TODAS");
  const [impactoFilter, setImpactoFilter] = useState<string>("TODOS");

  const { data, isLoading } = useQuery({
    queryKey: ["alteracoes", lidaFilter, impactoFilter],
    queryFn: () =>
      listarAlteracoes({
        lida:
          lidaFilter === "TODAS"
            ? undefined
            : lidaFilter === "NAO_LIDA"
            ? false
            : true,
        impacto: impactoFilter !== "TODOS" ? impactoFilter : undefined,
        size: 50,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: marcarComoLida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alteracoes"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: marcarTodasComoLidas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alteracoes"] });
      toast({ title: "Todas as alterações marcadas como lidas." });
    },
  });

  const alteracoes = data?.data ?? [];
  const naoLidas = alteracoes.filter((a) => !a.lida).length;

  return (
    <DashboardShell
      title="Monitorização Legislativa"
      description="Acompanhe as alterações ao Código do Trabalho e legislação complementar"
      actions={
        naoLidas > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="gap-2"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Marcar todas como lidas ({naoLidas})
          </Button>
        )
      }
    >
      {/* Filters */}
      <div className="mb-4 flex gap-2">
        <Select value={lidaFilter} onValueChange={setLidaFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas</SelectItem>
            <SelectItem value="NAO_LIDA">Não lidas</SelectItem>
            <SelectItem value="LIDA">Lidas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={impactoFilter} onValueChange={setImpactoFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os impactos</SelectItem>
            <SelectItem value="BAIXO">Baixo</SelectItem>
            <SelectItem value="MEDIO">Médio</SelectItem>
            <SelectItem value="ALTO">Alto</SelectItem>
            <SelectItem value="CRITICO">Crítico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : alteracoes.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Bell className="mb-3 h-12 w-12" />
          <p className="text-base font-medium">Sem alterações legislativas</p>
          <p className="mt-1 text-sm">
            {lidaFilter !== "TODAS" || impactoFilter !== "TODOS"
              ? "Tente ajustar os filtros."
              : "Não há alterações legislativas registadas."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alteracoes.map((alt: AlteracaoLegislativa) => (
            <Card
              key={alt.id}
              className={cn(
                "transition-all",
                !alt.lida && "border-l-4 border-l-indigo-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      alt.impacto === "CRITICO" || alt.impacto === "ALTO"
                        ? "bg-red-100 text-red-600"
                        : alt.impacto === "MEDIO"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                            {tipoLabel[alt.tipo] ?? alt.tipo}
                          </span>
                          <span className="text-xs text-slate-400">
                            {alt.diploma}
                          </span>
                          <Badge variant={impactoBadge[alt.impacto]}>
                            {impactoLabel[alt.impacto]}
                          </Badge>
                          {!alt.lida && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              Novo
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 text-sm font-semibold text-slate-900">
                          {alt.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {alt.resumo}
                        </p>

                        {/* Affected articles */}
                        {alt.artigosAfetados.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-xs text-slate-500 mr-1">
                              Artigos afetados:
                            </span>
                            {alt.artigosAfetados.map((a) => (
                              <span
                                key={a}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                          <span>
                            Publicação: {formatDate(alt.dataPublicacao)}
                          </span>
                          {alt.dataEntradaVigor && (
                            <span>
                              Vigor: {formatDate(alt.dataEntradaVigor)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {alt.url && (
                          <a
                            href={alt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                          >
                            DRE
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {!alt.lida && (
                          <button
                            onClick={() => markReadMutation.mutate(alt.id)}
                            disabled={markReadMutation.isPending}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Marcar lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
