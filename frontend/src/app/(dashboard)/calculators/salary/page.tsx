"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calculator, Euro, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularSalario } from "@/lib/api/calculators";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { CalculoSalarioResponse } from "@/lib/api/types";

const salarySchema = z.object({
  salarioBruto: z.number().min(820, "O salário bruto deve ser pelo menos €820"),
  numeroDependentes: z.number().min(0).max(20),
  outrosRendimentos: z.number().min(0).optional(),
});

type SalaryFormData = z.infer<typeof salarySchema>;

export default function SalaryPage() {
  const [resultado, setResultado] = useState<CalculoSalarioResponse | null>(
    null
  );

  const { register, handleSubmit, formState: { errors } } =
    useForm<SalaryFormData>({
      resolver: zodResolver(salarySchema),
      defaultValues: { numeroDependentes: 0 },
    });

  const calcMutation = useMutation({
    mutationFn: calcularSalario,
    onSuccess: (data) => setResultado(data),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro no cálculo",
        description: "Verifique os dados introduzidos.",
      });
    },
  });

  const totalDeducoes = resultado
    ? resultado.irsRetido + resultado.segurancaSocial
    : 0;

  return (
    <DashboardShell
      title="Simulador de Vencimento Líquido"
      description="Calcule o salário líquido após IRS e Segurança Social"
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
            <CardTitle className="text-base">Dados do vencimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) => calcMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="salarioBruto">Salário bruto mensal (€)</Label>
                <Input
                  id="salarioBruto"
                  type="number"
                  step="0.01"
                  placeholder="2000.00"
                  {...register("salarioBruto", { valueAsNumber: true })}
                />
                {errors.salarioBruto && (
                  <p className="text-xs text-destructive">
                    {errors.salarioBruto.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="numeroDependentes">
                  Número de dependentes
                </Label>
                <Input
                  id="numeroDependentes"
                  type="number"
                  min="0"
                  {...register("numeroDependentes", { valueAsNumber: true })}
                />
                {errors.numeroDependentes && (
                  <p className="text-xs text-destructive">
                    {errors.numeroDependentes.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="outrosRendimentos">
                  Outros rendimentos (€/mês){" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="outrosRendimentos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("outrosRendimentos", { valueAsNumber: true })}
                />
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
                Calcular salário líquido
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="lg:col-span-3">
          {resultado ? (
            <div className="space-y-4">
              {/* Main result */}
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-emerald-700">
                    Salário líquido mensal
                  </p>
                  <p className="mt-1 text-4xl font-bold text-emerald-900">
                    {formatCurrency(resultado.salarioLiquido)}
                  </p>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detalhe das deduções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Salário bruto</span>
                      <span className="font-medium">
                        {formatCurrency(resultado.salarioBruto)}
                      </span>
                    </div>
                    <div className="border-t pt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          Retenção na fonte (IRS)
                          <br />
                          <span className="text-xs text-slate-400">
                            Taxa: {resultado.taxaIrs.toFixed(1)}% —{" "}
                            {resultado.escalaoIrs}
                          </span>
                        </span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(resultado.irsRetido)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          Segurança Social
                          <br />
                          <span className="text-xs text-slate-400">
                            Taxa: 11%
                          </span>
                        </span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(resultado.segurancaSocial)}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          Total de deduções
                        </span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(totalDeducoes)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-base font-semibold">
                        <span>Salário líquido</span>
                        <span className="text-emerald-700">
                          {formatCurrency(resultado.salarioLiquido)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visual bar */}
              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Distribuição do salário bruto
                  </p>
                  <div className="flex h-8 overflow-hidden rounded-md">
                    <div
                      className="flex items-center justify-center bg-emerald-500 text-xs text-white"
                      style={{
                        width: `${(resultado.salarioLiquido / resultado.salarioBruto) * 100}%`,
                      }}
                    >
                      {((resultado.salarioLiquido / resultado.salarioBruto) * 100).toFixed(0)}%
                    </div>
                    <div
                      className="flex items-center justify-center bg-amber-400 text-xs text-white"
                      style={{
                        width: `${(resultado.irsRetido / resultado.salarioBruto) * 100}%`,
                      }}
                    >
                      IRS
                    </div>
                    <div
                      className="flex items-center justify-center bg-slate-400 text-xs text-white"
                      style={{
                        width: `${(resultado.segurancaSocial / resultado.salarioBruto) * 100}%`,
                      }}
                    >
                      SS
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Líquido
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      IRS
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      Seg. Social
                    </span>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-slate-400">
                Simulação indicativa. Os valores podem variar conforme a
                situação fiscal individual.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Euro className="mb-3 h-12 w-12" />
              <p className="text-base font-medium text-slate-600">
                Pronto para simular
              </p>
              <p className="mt-1 text-sm text-center">
                Introduza o salário bruto para obter o valor líquido a receber.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
