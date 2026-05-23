"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  FileText,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Clock,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buscarEstatisticas } from "@/lib/api/dashboard";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import type { DashboardStats } from "@/lib/api/types";

const atividadeTipoLabel: Record<string, string> = {
  CASO: "Processo",
  CONTRATO: "Contrato",
  COMPLIANCE: "Conformidade",
  DOCUMENTO: "Documento",
  PESQUISA: "Pesquisa",
};

const atividadeTipoBadge: Record<
  string,
  "default" | "info" | "success" | "warning" | "navy"
> = {
  CASO: "info",
  CONTRATO: "navy",
  COMPLIANCE: "success",
  DOCUMENTO: "warning",
  PESQUISA: "default",
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  href?: string;
  color?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
  color = "text-indigo-600",
}: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {value}
            </p>
            {description && (
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 ${color}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: buscarEstatisticas,
  });

  return (
    <DashboardShell
      title="Painel"
      description="Visão geral da sua atividade na plataforma"
    >
      {isError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Não foi possível carregar as estatísticas. Verifique a ligação ao
          servidor.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          title="Processos totais"
          value={isLoading ? "—" : (stats?.casosTotais ?? 0)}
          icon={Briefcase}
          href="/cases"
          color="text-indigo-600"
        />
        <StatCard
          title="Processos abertos"
          value={isLoading ? "—" : (stats?.casosAbertos ?? 0)}
          icon={TrendingUp}
          href="/cases"
          color="text-amber-500"
          description="Em andamento"
        />
        <StatCard
          title="Contratos analisados"
          value={isLoading ? "—" : (stats?.contratosAnalisados ?? 0)}
          icon={FileText}
          href="/contracts"
          color="text-blue-600"
        />
        <StatCard
          title="Verificações de conformidade"
          value={isLoading ? "—" : (stats?.verificacoesConformidade ?? 0)}
          icon={ShieldCheck}
          href="/compliance"
          color="text-emerald-600"
        />
        <StatCard
          title="Processos resolvidos"
          value={isLoading ? "—" : (stats?.casosResolvidos ?? 0)}
          icon={Briefcase}
          color="text-emerald-600"
          description="Este mês"
        />
        <StatCard
          title="Alertas legislativos"
          value={isLoading ? "—" : (stats?.alertasLegislativos ?? 0)}
          icon={AlertTriangle}
          href="/monitoring"
          color="text-red-500"
          description="Por ler"
        />
      </div>

      {/* Quick actions + Recent activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/chat" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Nova consulta jurídica
              </Button>
            </Link>
            <Link href="/cases" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                Abrir novo processo
              </Button>
            </Link>
            <Link href="/contracts" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Analisar contrato
              </Button>
            </Link>
            <Link href="/compliance" className="block">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Verificar conformidade
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-md bg-slate-100"
                  />
                ))}
              </div>
            ) : !stats?.atividadeRecente?.length ? (
              <div className="flex flex-col items-center py-8 text-center text-slate-400">
                <Clock className="mb-2 h-8 w-8" />
                <p className="text-sm">Sem atividade recente</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.atividadeRecente.slice(0, 8).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <Badge
                      variant={atividadeTipoBadge[item.tipo] ?? "default"}
                      className="shrink-0 text-xs"
                    >
                      {atividadeTipoLabel[item.tipo] ?? item.tipo}
                    </Badge>
                    <span className="flex-1 truncate text-sm text-slate-700">
                      {item.descricao}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDateTime(item.criadoEm)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
