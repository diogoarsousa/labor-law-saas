import { ExternalLink, Calendar, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Jurisprudencia } from "@/lib/api/types";

interface SearchResultsProps {
  /** List of jurisprudence results to display */
  resultados: Jurisprudencia[];
  /** Total count from the API */
  total?: number;
}

/**
 * Renders a list of jurisprudence search results.
 * Each entry shows the court, process number, date, and legal descriptors.
 */
export function SearchResults({ resultados, total }: SearchResultsProps) {
  if (resultados.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-slate-400">
        <Scale className="mb-3 h-12 w-12" />
        <p className="text-base font-medium">Nenhum resultado encontrado</p>
        <p className="mt-1 text-sm">Tente ajustar os termos de pesquisa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {total !== undefined && (
        <p className="text-sm text-slate-500">
          {total} acórdão(s) encontrado(s)
        </p>
      )}

      {resultados.map((j) => (
        <Card key={j.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Tribunal + Processo */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="navy" className="shrink-0">
                    {j.tribunal}
                  </Badge>
                  <span className="text-sm font-medium text-slate-700">
                    Proc. {j.processo}
                  </span>
                  {j.relator && (
                    <span className="text-xs text-slate-500">
                      Rel. {j.relator}
                    </span>
                  )}
                </div>

                {/* Summary */}
                <p className="mt-2 text-sm text-slate-700 leading-relaxed font-legal line-clamp-3">
                  {j.sumario}
                </p>

                {/* Descriptors */}
                {j.descritores.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {j.descritores.slice(0, 5).map((d) => (
                      <span
                        key={d}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {d}
                      </span>
                    ))}
                    {j.descritores.length > 5 && (
                      <span className="text-xs text-slate-400">
                        +{j.descritores.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Date + Link */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {formatDate(j.data)}
                </span>
                {j.url && (
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                  >
                    Texto integral
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
