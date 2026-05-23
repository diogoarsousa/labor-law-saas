"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, Loader2, CheckCircle, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { verificarConformidade } from "@/lib/api/compliance";
import { toast } from "@/hooks/use-toast";
import type { ComplianceResultado, ComplianceTipo } from "@/lib/api/types";

const complianceSchema = z.object({
  tipo: z.enum([
    "POLITICA_FERIAS",
    "HORARIO_TRABALHO",
    "SALARIO_MINIMO",
    "DESPEDIMENTO",
    "CONTRATACAO",
    "SEGURANCA_HIGIENE",
  ] as const),
  diasFerias: z.number().min(0).optional(),
  horasSemanais: z.number().min(0).optional(),
  salarioPago: z.number().min(0).optional(),
  numeroPessoal: z.number().min(0).optional(),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

const tipoLabels: Record<ComplianceTipo, string> = {
  POLITICA_FERIAS: "Política de férias",
  HORARIO_TRABALHO: "Horário de trabalho",
  SALARIO_MINIMO: "Salário mínimo",
  DESPEDIMENTO: "Despedimento",
  CONTRATACAO: "Contratação",
  SEGURANCA_HIGIENE: "Segurança e higiene",
};

const gravidadeBadge: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  BAIXA: "info",
  MEDIA: "warning",
  ALTA: "danger",
  CRITICA: "danger",
};

export default function CompliancePage() {
  const [resultado, setResultado] = useState<ComplianceResultado | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<ComplianceTipo>(
    "HORARIO_TRABALHO"
  );

  const { register, handleSubmit, setValue } =
    useForm<ComplianceFormData>({
      resolver: zodResolver(complianceSchema),
      defaultValues: { tipo: "HORARIO_TRABALHO" },
    });

  const checkMutation = useMutation({
    mutationFn: verificarConformidade,
    onSuccess: (data) => {
      setResultado(data);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao verificar conformidade",
        description: "Tente novamente.",
      });
    },
  });

  const onSubmit = (data: ComplianceFormData) => {
    const dados: Record<string, unknown> = {};
    if (data.diasFerias !== undefined) dados.diasFerias = data.diasFerias;
    if (data.horasSemanais !== undefined) dados.horasSemanais = data.horasSemanais;
    if (data.salarioPago !== undefined) dados.salarioPago = data.salarioPago;
    if (data.numeroPessoal !== undefined) dados.numeroPessoal = data.numeroPessoal;

    checkMutation.mutate({ tipo: data.tipo, dados });
  };

  return (
    <DashboardShell
      title="Verificador de Conformidade"
      description="Verifique se as suas práticas laborais cumprem o Código do Trabalho"
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Nova verificação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Tipo */}
              <div className="space-y-1.5">
                <Label>Área de conformidade</Label>
                <Select
                  defaultValue="HORARIO_TRABALHO"
                  onValueChange={(v) => {
                    setValue("tipo", v as ComplianceTipo);
                    setSelectedTipo(v as ComplianceTipo);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic fields based on type */}
              {(selectedTipo === "POLITICA_FERIAS") && (
                <div className="space-y-1.5">
                  <Label htmlFor="diasFerias">Dias de férias concedidos</Label>
                  <Input
                    id="diasFerias"
                    type="number"
                    placeholder="22"
                    {...register("diasFerias", { valueAsNumber: true })}
                  />
                </div>
              )}

              {(selectedTipo === "HORARIO_TRABALHO") && (
                <div className="space-y-1.5">
                  <Label htmlFor="horasSemanais">
                    Horas de trabalho semanais
                  </Label>
                  <Input
                    id="horasSemanais"
                    type="number"
                    placeholder="40"
                    {...register("horasSemanais", { valueAsNumber: true })}
                  />
                </div>
              )}

              {(selectedTipo === "SALARIO_MINIMO") && (
                <div className="space-y-1.5">
                  <Label htmlFor="salarioPago">Salário pago (€/mês)</Label>
                  <Input
                    id="salarioPago"
                    type="number"
                    step="0.01"
                    placeholder="820.00"
                    {...register("salarioPago", { valueAsNumber: true })}
                  />
                </div>
              )}

              {(selectedTipo === "CONTRATACAO" || selectedTipo === "SEGURANCA_HIGIENE") && (
                <div className="space-y-1.5">
                  <Label htmlFor="numeroPessoal">
                    Número de trabalhadores
                  </Label>
                  <Input
                    id="numeroPessoal"
                    type="number"
                    placeholder="50"
                    {...register("numeroPessoal", { valueAsNumber: true })}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={checkMutation.isPending}
              >
                {checkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Verificar conformidade
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3">
          {checkMutation.isPending ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm">A verificar conformidade legal...</p>
            </div>
          ) : resultado ? (
            <div className="space-y-4">
              {/* Overall result */}
              <Card
                className={
                  resultado.conforme
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <CardContent className="flex items-center gap-4 p-6">
                  {resultado.conforme ? (
                    <CheckCircle className="h-10 w-10 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-600 shrink-0" />
                  )}
                  <div>
                    <p
                      className={`text-lg font-semibold ${
                        resultado.conforme
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      {resultado.conforme ? "Conforme" : "Não conforme"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Pontuação de conformidade:{" "}
                      <strong>{resultado.pontuacao}/100</strong> —{" "}
                      {resultado.violacoes.length} violação(ões)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Violations */}
              {resultado.violacoes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Violações identificadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {resultado.violacoes.map((v, i) => (
                        <li
                          key={i}
                          className="rounded-md border border-slate-200 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant={gravidadeBadge[v.gravidade]}>
                              {v.gravidade}
                            </Badge>
                            <span className="text-xs font-medium text-indigo-600">
                              {v.artigo}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-slate-700">
                            {v.descricao}
                          </p>
                          {v.sugestao && (
                            <p className="mt-1 text-xs text-slate-500 italic">
                              Sugestão: {v.sugestao}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {resultado.recomendacoes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {resultado.recomendacoes.map((r, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ShieldCheck className="mb-3 h-12 w-12" />
              <p className="text-base font-medium text-slate-600">
                Pronto para verificar
              </p>
              <p className="mt-1 text-sm text-center">
                Selecione a área de conformidade e preencha os dados para obter
                a análise legal.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
