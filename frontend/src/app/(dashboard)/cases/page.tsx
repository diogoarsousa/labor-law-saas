"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Loader2, Briefcase } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseCard } from "@/components/cases/CaseCard";
import { CaseForm } from "@/components/cases/CaseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listarCasos, criarCaso } from "@/lib/api/cases";
import { toast } from "@/hooks/use-toast";
import type { CasoCreateRequest } from "@/lib/api/types";

export default function CasesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [tipoFilter, setTipoFilter] = useState<string>("TODOS");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["casos", estadoFilter, tipoFilter, search],
    queryFn: () =>
      listarCasos({
        estado: estadoFilter !== "TODOS" ? estadoFilter : undefined,
        tipo: tipoFilter !== "TODOS" ? tipoFilter : undefined,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: criarCaso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["casos"] });
      setShowForm(false);
      toast({ title: "Processo criado com sucesso." });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao criar processo",
        description: "Tente novamente.",
      });
    },
  });

  const handleCreate = async (data: CasoCreateRequest) => {
    createMutation.mutate(data);
  };

  const casos = data?.data ?? [];

  return (
    <DashboardShell
      title="Processos"
      description="Gerencie e acompanhe todos os processos laborais"
      actions={
        !showForm && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo processo
          </Button>
        )
      }
    >
      {/* New case form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Novo processo</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Pesquisar processos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-44">
              <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os estados</SelectItem>
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

          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os tipos</SelectItem>
              <SelectItem value="DESPEDIMENTO">Despedimento</SelectItem>
              <SelectItem value="ASSEDIO">Assédio</SelectItem>
              <SelectItem value="SALARIO">Salário</SelectItem>
              <SelectItem value="HORAS_EXTRA">Horas extra</SelectItem>
              <SelectItem value="FERIAS">Férias</SelectItem>
              <SelectItem value="SUBSIDIO">Subsídio</SelectItem>
              <SelectItem value="CONTRATO">Contrato</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cases list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar os processos.
        </div>
      ) : casos.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Briefcase className="mb-3 h-12 w-12" />
          <p className="text-base font-medium">Nenhum processo encontrado</p>
          <p className="mt-1 text-sm">
            {search || estadoFilter !== "TODOS" || tipoFilter !== "TODOS"
              ? "Tente ajustar os filtros."
              : "Clique em \"Novo processo\" para começar."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500">
            {data?.meta?.total ?? casos.length} processo(s) encontrado(s)
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {casos.map((caso) => (
              <CaseCard key={caso.id} caso={caso} />
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
