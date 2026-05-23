import Link from "next/link";
import { Calendar, User, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Caso } from "@/lib/api/types";

const estadoBadge: Record<
  Caso["estado"],
  "default" | "info" | "success" | "warning" | "danger" | "navy"
> = {
  ABERTO: "info",
  EM_ANDAMENTO: "warning",
  AGUARDANDO_DOCUMENTOS: "warning",
  EM_REVISAO: "navy",
  RESOLVIDO: "success",
  FECHADO: "default",
};

const estadoLabel: Record<Caso["estado"], string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_DOCUMENTOS: "Aguarda documentos",
  EM_REVISAO: "Em revisão",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

const prioridadeBadge: Record<
  Caso["prioridade"],
  "default" | "info" | "success" | "warning" | "danger"
> = {
  BAIXA: "default",
  MEDIA: "info",
  ALTA: "warning",
  URGENTE: "danger",
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

interface CaseCardProps {
  /** The case data to display */
  caso: Caso;
}

/** Compact case summary card used in the cases list */
export function CaseCard({ caso }: CaseCardProps) {
  return (
    <Link href={`/cases/${caso.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={estadoBadge[caso.estado]}>
                  {estadoLabel[caso.estado]}
                </Badge>
                <Badge variant={prioridadeBadge[caso.prioridade]}>
                  {caso.prioridade}
                </Badge>
                <span className="text-xs text-slate-500">
                  {tipoLabel[caso.tipo] ?? caso.tipo}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-slate-900 truncate">
                {caso.titulo}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {caso.descricao}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(caso.dataAbertura)}
            </span>
            {caso.trabalhador && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {caso.trabalhador}
              </span>
            )}
            {caso.empresa && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {caso.empresa}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
