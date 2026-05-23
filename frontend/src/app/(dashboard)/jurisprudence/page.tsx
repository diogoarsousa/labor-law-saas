"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchResults } from "@/components/jurisprudence/SearchResults";
import { pesquisarJurisprudencia } from "@/lib/api/jurisprudence";
import type { JurisprudenciaSearchRequest } from "@/lib/api/types";

const searchSchema = z.object({
  query: z.string().min(2, "Introduza pelo menos 2 caracteres"),
  tribunal: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

const tribunais = [
  { value: "TODOS", label: "Todos os tribunais" },
  { value: "STJ", label: "Supremo Tribunal de Justiça" },
  { value: "TRL", label: "Tribunal da Relação de Lisboa" },
  { value: "TRP", label: "Tribunal da Relação do Porto" },
  { value: "TRC", label: "Tribunal da Relação de Coimbra" },
  { value: "TRE", label: "Tribunal da Relação de Évora" },
  { value: "TRG", label: "Tribunal da Relação de Guimarães" },
];

export default function JurisprudencePage() {
  const [searchParams, setSearchParams] =
    useState<JurisprudenciaSearchRequest | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<SearchFormData>({
      resolver: zodResolver(searchSchema),
    });

  const { data, isFetching } = useQuery({
    queryKey: ["jurisprudencia", searchParams],
    queryFn: () => pesquisarJurisprudencia(searchParams!),
    enabled: Boolean(searchParams),
  });

  const onSubmit = (formData: SearchFormData) => {
    setSearchParams({
      query: formData.query,
      tribunal:
        formData.tribunal && formData.tribunal !== "TODOS"
          ? formData.tribunal
          : undefined,
      dataInicio: formData.dataInicio || undefined,
      dataFim: formData.dataFim || undefined,
      size: 20,
    });
  };

  return (
    <DashboardShell
      title="Pesquisa de Jurisprudência"
      description="Pesquise acórdãos e decisões judiciais em matéria laboral"
    >
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Search form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="query">Termos de pesquisa</Label>
                <Input
                  id="query"
                  placeholder="Ex.: despedimento justa causa"
                  {...register("query")}
                />
                {errors.query && (
                  <p className="text-xs text-destructive">
                    {errors.query.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tribunal</Label>
                <Select
                  defaultValue="TODOS"
                  onValueChange={(v) => setValue("tribunal", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tribunais.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataInicio">Data de início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  {...register("dataInicio")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataFim">Data de fim</Label>
                <Input id="dataFim" type="date" {...register("dataFim")} />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isFetching}>
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Pesquisar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3">
          {isFetching ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-500">A pesquisar jurisprudência...</p>
            </div>
          ) : data ? (
            <SearchResults
              resultados={data.data}
              total={data.meta?.total}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Filter className="mb-3 h-12 w-12" />
              <p className="text-base font-medium text-slate-600">
                Pronto para pesquisar
              </p>
              <p className="mt-1 text-sm text-center">
                Introduza termos de pesquisa para encontrar acórdãos relevantes
                em matéria laboral.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
