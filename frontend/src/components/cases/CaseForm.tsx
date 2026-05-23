"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Caso, CasoCreateRequest } from "@/lib/api/types";

const casoSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
  tipo: z.enum([
    "DESPEDIMENTO",
    "ASSEDIO",
    "SALARIO",
    "HORAS_EXTRA",
    "FERIAS",
    "SUBSIDIO",
    "CONTRATO",
    "OUTRO",
  ] as const),
  prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"] as const),
  cliente: z.string().optional(),
  trabalhador: z.string().optional(),
  empresa: z.string().optional(),
});

type CasoFormData = z.infer<typeof casoSchema>;

const tipoLabels: Record<CasoFormData["tipo"], string> = {
  DESPEDIMENTO: "Despedimento",
  ASSEDIO: "Assédio",
  SALARIO: "Salário",
  HORAS_EXTRA: "Horas extra",
  FERIAS: "Férias",
  SUBSIDIO: "Subsídio",
  CONTRATO: "Contrato",
  OUTRO: "Outro",
};

const prioridadeLabels: Record<CasoFormData["prioridade"], string> = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

interface CaseFormProps {
  /** Existing case for editing, omit for creation */
  defaultValues?: Partial<Caso>;
  /** Called on successful submission with the form data */
  onSubmit: (data: CasoCreateRequest) => Promise<void>;
  /** Called when the form is cancelled */
  onCancel?: () => void;
  /** Whether a submission is in progress */
  isSubmitting?: boolean;
}

/** Reusable form for creating and editing labor cases */
export function CaseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CaseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CasoFormData>({
    resolver: zodResolver(casoSchema),
    defaultValues: {
      titulo: defaultValues?.titulo ?? "",
      descricao: defaultValues?.descricao ?? "",
      tipo: defaultValues?.tipo ?? "OUTRO",
      prioridade: defaultValues?.prioridade ?? "MEDIA",
      cliente: defaultValues?.cliente ?? "",
      trabalhador: defaultValues?.trabalhador ?? "",
      empresa: defaultValues?.empresa ?? "",
    },
  });

  const handleFormSubmit = async (data: CasoFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Título */}
      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título do processo</Label>
        <Input
          id="titulo"
          placeholder="Ex.: Despedimento sem justa causa — João Silva"
          {...register("titulo")}
        />
        {errors.titulo && (
          <p className="text-xs text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva os factos relevantes do processo..."
          rows={4}
          {...register("descricao")}
        />
        {errors.descricao && (
          <p className="text-xs text-destructive">{errors.descricao.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tipo */}
        <div className="space-y-1.5">
          <Label>Tipo de processo</Label>
          <Select
            defaultValue={defaultValues?.tipo ?? "OUTRO"}
            onValueChange={(v) => setValue("tipo", v as CasoFormData["tipo"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tipoLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prioridade */}
        <div className="space-y-1.5">
          <Label>Prioridade</Label>
          <Select
            defaultValue={defaultValues?.prioridade ?? "MEDIA"}
            onValueChange={(v) =>
              setValue("prioridade", v as CasoFormData["prioridade"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(prioridadeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trabalhador */}
        <div className="space-y-1.5">
          <Label htmlFor="trabalhador">
            Trabalhador{" "}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="trabalhador"
            placeholder="Nome do trabalhador"
            {...register("trabalhador")}
          />
        </div>

        {/* Empresa */}
        <div className="space-y-1.5">
          <Label htmlFor="empresa">
            Empresa{" "}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="empresa"
            placeholder="Nome da empresa"
            {...register("empresa")}
          />
        </div>

        {/* Cliente */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="cliente">
            Cliente{" "}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </Label>
          <Input
            id="cliente"
            placeholder="Nome do cliente que solicitou este processo"
            {...register("cliente")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Guardar alterações" : "Criar processo"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
