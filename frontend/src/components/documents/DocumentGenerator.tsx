"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { FileText, Loader2, Download } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gerarDocumento, exportarDocumento } from "@/lib/api/documents";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { DocumentoGerado, DocumentoTipo } from "@/lib/api/types";

const docSchema = z.object({
  tipo: z.enum([
    "CARTA_DESPEDIMENTO",
    "CONTRATO_TRABALHO",
    "ACORDO_CESSACAO",
    "AVISO_PREVIO",
    "RECIBO_VENCIMENTO",
    "DECLARACAO_TRABALHO",
    "REGULAMENTO_INTERNO",
  ] as const),
  nomeTrabalhador: z.string().min(2, "Nome obrigatório"),
  nomeEmpresa: z.string().min(2, "Nome da empresa obrigatório"),
  dataDocumento: z.string().min(1, "Data obrigatória"),
  observacoes: z.string().optional(),
});

type DocFormData = z.infer<typeof docSchema>;

const tipoLabels: Record<DocumentoTipo, string> = {
  CARTA_DESPEDIMENTO: "Carta de despedimento",
  CONTRATO_TRABALHO: "Contrato de trabalho",
  ACORDO_CESSACAO: "Acordo de cessação",
  AVISO_PREVIO: "Aviso prévio",
  RECIBO_VENCIMENTO: "Recibo de vencimento",
  DECLARACAO_TRABALHO: "Declaração de trabalho",
  REGULAMENTO_INTERNO: "Regulamento interno",
};

interface DocumentGeneratorProps {
  /** Called when a document is successfully generated */
  onGenerated?: (doc: DocumentoGerado) => void;
}

/** Form to generate AI legal documents */
export function DocumentGenerator({ onGenerated }: DocumentGeneratorProps) {
  const [generatedDoc, setGeneratedDoc] = useState<DocumentoGerado | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<DocFormData>({
      resolver: zodResolver(docSchema),
      defaultValues: { tipo: "DECLARACAO_TRABALHO" },
    });

  const generateMutation = useMutation({
    mutationFn: gerarDocumento,
    onSuccess: (doc) => {
      setGeneratedDoc(doc);
      onGenerated?.(doc);
      toast({ title: "Documento gerado com sucesso." });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao gerar documento",
        description: "Tente novamente.",
      });
    },
  });

  const handleExport = async (formato: "PDF" | "DOCX") => {
    if (!generatedDoc) return;
    setIsExporting(true);
    try {
      const blob = await exportarDocumento(generatedDoc.id, formato);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedDoc.titulo}.${formato.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar o documento.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const onSubmit = (data: DocFormData) => {
    generateMutation.mutate({
      tipo: data.tipo,
      parametros: {
        nomeTrabalhador: data.nomeTrabalhador,
        nomeEmpresa: data.nomeEmpresa,
        dataDocumento: data.dataDocumento,
        observacoes: data.observacoes,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerar novo documento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tipo */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tipo de documento</Label>
                <Select
                  defaultValue="DECLARACAO_TRABALHO"
                  onValueChange={(v) => setValue("tipo", v as DocumentoTipo)}
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

              <div className="space-y-1.5">
                <Label htmlFor="nomeTrabalhador">Nome do trabalhador</Label>
                <Input
                  id="nomeTrabalhador"
                  placeholder="Ana Silva"
                  {...register("nomeTrabalhador")}
                />
                {errors.nomeTrabalhador && (
                  <p className="text-xs text-destructive">
                    {errors.nomeTrabalhador.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nomeEmpresa">Nome da empresa</Label>
                <Input
                  id="nomeEmpresa"
                  placeholder="Empresa Lda."
                  {...register("nomeEmpresa")}
                />
                {errors.nomeEmpresa && (
                  <p className="text-xs text-destructive">
                    {errors.nomeEmpresa.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataDocumento">Data do documento</Label>
                <Input
                  id="dataDocumento"
                  type="date"
                  {...register("dataDocumento")}
                />
                {errors.dataDocumento && (
                  <p className="text-xs text-destructive">
                    {errors.dataDocumento.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="observacoes">
                  Instruções adicionais{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Detalhe qualquer informação específica a incluir no documento..."
                  rows={3}
                  {...register("observacoes")}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={generateMutation.isPending}
              className="gap-2"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Gerar documento
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated document preview */}
      {generatedDoc && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{generatedDoc.titulo}</CardTitle>
                <p className="mt-0.5 text-xs text-slate-500">
                  Gerado em {formatDateTime(generatedDoc.criadoEm)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("PDF")}
                  disabled={isExporting}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("DOCX")}
                  disabled={isExporting}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  DOCX
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-6">
              <pre className="whitespace-pre-wrap font-legal text-sm leading-relaxed text-slate-800">
                {generatedDoc.conteudo}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
