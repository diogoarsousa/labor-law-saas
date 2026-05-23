"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  Edit,
  Loader2,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseForm } from "@/components/cases/CaseForm";
import { buscarCaso, atualizarCaso } from "@/lib/api/cases";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { CasoEstado, CasoUpdateRequest } from "@/lib/api/types";

const estadoBadge: Record<string, "default" | "info" | "success" | "warning" | "danger" | "navy"> = {
  ABERTO: "info",
  EM_ANDAMENTO: "warning",
  AGUARDANDO_DOCUMENTOS: "warning",
  EM_REVISAO: "navy",
  RESOLVIDO: "success",
  FECHADO: "default",
};

const estadoLabel: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_DOCUMENTOS: "Aguarda documentos",
  EM_REVISAO: "Em revisão",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

const tipoLabel: Record<string, string> = {
  DESPEDIMENTO: "Despedimento",
  ASSEDIO: "Assédio",
  SALARIO: "Salário",
  HORAS_EXTRA: "Horas extra",
  FERIAS: "Férias",
  SUBSIDIO: "Subsídio",
  CONTRATO: "Contrato",
  OUTRO: "Outro",
};

export default function CaseDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [editing, setEditing] = useState(false);

  const { data: caso, isLoading, isError } = useQuery({
    queryKey: ["caso", id],
    queryFn: () => buscarCaso(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CasoUpdateRequest) => atualizarCaso(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caso", id] });
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      setEditing(false);
      toast({ title: "Processo atualizado com sucesso." });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar processo",
      });
    },
  });

  const handleEstadoChange = (estado: string) => {
    updateMutation.mutate({ estado: estado as CasoEstado });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !caso) {
    return (
      <DashboardShell title="Processo não encontrado">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Este processo não existe ou não tem permissão para o ver.
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/cases">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos processos
          </Link>
        </Button>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={caso.titulo}
      description={`Processo aberto em ${formatDate(caso.dataAbertura)}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
            className="gap-1.5"
          >
            <Edit className="h-3.5 w-3.5" />
            {editing ? "Cancelar edição" : "Editar"}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/cases">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Voltar
            </Link>
          </Button>
        </div>
      }
    >
      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editar processo</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseForm
              defaultValues={caso}
              onSubmit={async (data) => {
                updateMutation.mutate(data);
              }}
              onCancel={() => setEditing(false)}
              isSubmitting={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main details */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detalhes do processo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Descrição
                  </p>
                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed font-legal">
                    {caso.descricao}
                  </p>
                </div>

                {caso.notas && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Notas
                    </p>
                    <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                      {caso.notas}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                {!caso.documentos?.length ? (
                  <div className="flex flex-col items-center py-6 text-slate-400">
                    <Paperclip className="mb-2 h-8 w-8" />
                    <p className="text-sm">Sem documentos anexados</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {caso.documentos.map((doc) => (
                      <li key={doc.id} className="flex items-center gap-3 py-2">
                        <Paperclip className="h-4 w-4 text-slate-400" />
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline"
                        >
                          {doc.nome}
                        </a>
                        <span className="ml-auto text-xs text-slate-400">
                          {formatDate(doc.criadoEm)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estado do processo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={estadoBadge[caso.estado]}>
                    {estadoLabel[caso.estado]}
                  </Badge>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-slate-500">
                    Atualizar estado:
                  </p>
                  <Select
                    defaultValue={caso.estado}
                    onValueChange={handleEstadoChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ABERTO">Aberto</SelectItem>
                      <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                      <SelectItem value="AGUARDANDO_DOCUMENTOS">
                        Aguarda documentos
                      </SelectItem>
                      <SelectItem value="EM_REVISAO">Em revisão</SelectItem>
                      <SelectItem value="RESOLVIDO">Resolvido</SelectItem>
                      <SelectItem value="FECHADO">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-20 text-slate-500 shrink-0">Tipo</span>
                  <span className="text-slate-900 font-medium">
                    {tipoLabel[caso.tipo] ?? caso.tipo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-20 text-slate-500 shrink-0">Prioridade</span>
                  <span className="text-slate-900 font-medium">
                    {caso.prioridade}
                  </span>
                </div>
                {caso.trabalhador && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-900">{caso.trabalhador}</span>
                  </div>
                )}
                {caso.empresa && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-900">{caso.empresa}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-900">
                    {formatDate(caso.dataAbertura)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-slate-400">
                    Atualizado em {formatDateTime(caso.atualizadoEm)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
