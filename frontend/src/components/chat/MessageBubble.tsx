import { Scale, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ChatMensagem } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  /** The message to display */
  message: ChatMensagem;
}

/**
 * Renders a single chat message bubble.
 * Assistant messages appear on the left; user messages on the right.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.papel === "UTILIZADOR";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-navy-800 text-white"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Scale className="h-4 w-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-white border border-slate-200 text-slate-900"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.conteudo}
        </p>

        {/* Legal citations */}
        {!isUser && message.citacoes && message.citacoes.length > 0 && (
          <div className="mt-3 border-t border-slate-200 pt-2">
            <p className="mb-1.5 text-xs font-medium text-slate-500">
              Referências legais:
            </p>
            <ul className="space-y-1">
              {message.citacoes.map((cit, i) => (
                <li key={i} className="text-xs">
                  {cit.url ? (
                    <a
                      href={cit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {cit.diploma} — {cit.artigo}
                    </a>
                  ) : (
                    <span className="text-slate-600">
                      {cit.diploma} — {cit.artigo}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <p
          className={cn(
            "mt-1.5 text-[10px]",
            isUser ? "text-indigo-200" : "text-slate-400"
          )}
        >
          {formatDateTime(message.criadoEm)}
        </p>
      </div>
    </div>
  );
}
