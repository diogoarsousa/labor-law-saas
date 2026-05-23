"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calculator, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularIndemnizacao } from "@/lib/api/calculators";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { CalculoIndemnizacaoResponse, MotivoDespedimento } from "@/lib/api/types";

const severanceSchema = z.object({
  salarioBase: z
    .number()
    .min(820, "O salário base deve ser pelo menos o salário mínimo (€820)"),
  diuturnidades: z.number().min(0).optional(),
  dataAdmissao: z.string().min(1, "A data de admissão é obrigatória"),
  dataFim: z.string().min(1, "A data de cessação é obrigatória"),
  motivoDespedimento: z.enum([
    "COLETIVO",
    "EXTINÇÃO_POSTO",
    "INADAPTACAO",
    "JUSTA_CAUSA",
    "ACORDO",
  ] as const),
});

type SeveranceFormData = z.infer<typeof severanceSchema>;

const motivoLabels: Record<MotivoDespedimento, string> = {
  COLETIVO: "Despedimento colectivo",
  EXTINÇÃO_POSTO: "Extinção do posto de trabalho",
  INADAPTACAO: "Inadaptação",
  JUSTA_CAUSA: "Justa causa",
  ACORDO: "Acordo de cessação",
};

export default function SeverancePage() {
  const [resultado, setResultado] = useState<CalculoIndemnizacaoResponse | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SeveranceFormData>({
    resolver: zodResolver(severanceSchema),
    defaultValues: { motivoDespedimento: "EXTINÇÃO_POSTO" },
  });

  const calcMutation = useMutation({
    mutationFn: calcularIndemnizacao,
    onSuccess: (data) => setResultado(data),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro no cálculo",
        description: "Verifique os dados e tente novamente.",
      });
    },
  });

  return (
    <DashboardShell
      title="Calculadora de Indemnização"
      description="Cálculo de indemnização por despedimento — Art. 366.º do Código do Trabalho"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/calculators">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Calculadoras
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dados do trabalhador</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => calcMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="salarioBase">Salário base (€/mês)</Label>
                <Input
                  id="salarioBase"
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  {...register("salarioBase", { valueAsNumber: true })}
                />
                {errors.salarioBase && (
                  <p className="text-xs text-destructive">
                    {errors.salarioBase.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="diuturnidades">
                  Diuturnidades (€/mês){" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="diuturnidades"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("diuturnidades", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataAdmissao">Data de admissão</Label>
                <Input
                  id="dataAdmissao"
                  type="date"
                  {...register("dataAdmissao")}
                />
                {errors.dataAdmissao && (
                  <p className="text-xs text-destructive">
                    {errors.dataAdmissao.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataFim">Data de cessação</Label>
                <Input
                  id="dataFim"
                  type="date"
                  {...register("dataFim")}
                />
                {errors.dataFim && (
                  <p className="text-xs text-destructive">
                    {errors.dataFim.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Motivo do despedimento</Label>
                <Select
                  defaultValue="EXTINÇÃO_POSTO"
                  onValueChange={(v) =>
                    setValue(
                      "motivoDespedimento",
                      v as MotivoDespedimento
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(motivoLabels).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={calcMutation.isPending}
              >
                {calcMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="h-4 w-4" />
                )}
                Calcular indemnização
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="lg:col-span-3">
          {resultado ? (
            <div className="space-y-4">
              {/* Main result */}
              <Card className="border-indigo-200 bg-indigo-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-indigo-700">
                    Indemnização total devida
                  </p>
                  <p className="mt-1 text-4xl font-bold text-indigo-900">
                    {formatCurrency(resultado.indemnizacaoTotal)}
                  </p>
                  <p className="mt-1 text-sm text-indigo-600">
                    Antiguidade:{" "}
                    <strong>
                      {resultado.anosServico} ano(s) e{" "}
                      {resultado.mesesServico % 12} mês(es)
                    </strong>
                  </p>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detalhe do cálculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-slate-600">Base de cálculo</span>
                    <span className="font-medium">{resultado.baseCalculo}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-slate-600">Indemnização base</span>
                    <span className="font-medium">
                      {formatCurrency(resultado.indemnizacaoBase)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="font-semibold text-indigo-700">
                      {formatCurrency(resultado.indemnizacaoTotal)}
                    </span>
                  </div>

                  <div className="mt-3 rounded-md bg-slate-50 p-3">
                    <p className="text-xs text-slate-600 font-legal leading-relaxed">
                      {resultado.detalhe}
                    </p>
                  </div>

                  {resultado.artigosAplicaveis.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Base legal:
                      </p>
                      <ul className="flex flex-wrap gap-1">
                        {resultado.artigosAplicaveis.map((a) => (
                          <li
                            key={a}
                            className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="text-xs text-slate-400">
                Nota: Este cálculo é indicativo. Consulte um advogado para
                aconselhamento legal específico ao seu caso.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Calculator className="mb-3 h-12 w-12" />
              <p className="text-base font-medium text-slate-600">
                Pronto para calcular
              </p>
              <p className="mt-1 text-sm text-center">
                Preencha os dados do trabalhador para obter o valor da
                indemnização.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
