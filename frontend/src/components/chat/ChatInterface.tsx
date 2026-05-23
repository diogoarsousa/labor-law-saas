"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, PlusCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "./MessageBubble";
import {
  enviarMensagem,
  buscarHistoricoSessao,
  listarSessoes,
} from "@/lib/api/chat";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import type { ChatMensagem } from "@/lib/api/types";

/** Full chat interface with session history sidebar and message thread */
export function ChatInterface() {
  const queryClient = useQueryClient();
  const [sessaoId, setSessaoId] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMensagem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load sessions list
  const { data: sessoes = [] } = useQuery({
    queryKey: ["chat-sessoes"],
    queryFn: listarSessoes,
  });

  // Load messages for the active session
  const { data: historico = [] } = useQuery({
    queryKey: ["chat-historico", sessaoId],
    queryFn: () => buscarHistoricoSessao(sessaoId!),
    enabled: Boolean(sessaoId),
  });

  const messages = sessaoId ? historico : localMessages;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: enviarMensagem,
    onSuccess: (data) => {
      setSessaoId(data.sessaoId);
      if (sessaoId) {
        queryClient.invalidateQueries({
          queryKey: ["chat-historico", data.sessaoId],
        });
      } else {
        setLocalMessages((prev) => [...prev, data.mensagem]);
      }
      queryClient.invalidateQueries({ queryKey: ["chat-sessoes"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description:
          "Não foi possível contactar o assistente. Verifique a ligação.",
      });
    },
  });

  const handleSend = () => {
    const texto = inputText.trim();
    if (!texto || sendMutation.isPending) return;

    // Optimistically add user message
    const optimisticUserMsg: ChatMensagem = {
      id: `tmp-${Date.now()}`,
      sessaoId: sessaoId ?? "nova",
      papel: "UTILIZADOR",
      conteudo: texto,
      criadoEm: new Date().toISOString(),
    };

    if (!sessaoId) {
      setLocalMessages((prev) => [...prev, optimisticUserMsg]);
    }

    setInputText("");
    sendMutation.mutate({ mensagem: texto, sessaoId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    setSessaoId(undefined);
    setLocalMessages([]);
    queryClient.removeQueries({ queryKey: ["chat-historico"] });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* Sessions sidebar */}
      <div className="hidden w-56 flex-col border-r border-slate-200 bg-slate-50 lg:flex">
        <div className="border-b border-slate-200 p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleNewSession}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nova conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {sessoes.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-400">
              Sem conversas anteriores
            </p>
          ) : (
            <ul className="space-y-0.5 px-2">
              {sessoes.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSessaoId(s.id)}
                    className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors ${
                      sessaoId === s.id
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <p className="truncate font-medium">{s.titulo}</p>
                    <p className="mt-0.5 text-slate-400">
                      {formatDate(s.criadoEm)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 px-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <Send className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-base font-medium text-slate-700">
                Como posso ajudar?
              </h3>
              <p className="mt-1 text-sm">
                Faça uma pergunta sobre Direito do Trabalho português.
                Posso ajudar com o Código do Trabalho, contratos, despedimentos,
                férias e muito mais.
              </p>
              <div className="mt-6 grid gap-2 text-left w-full max-w-sm">
                {[
                  "Quais são os períodos de aviso prévio para despedimento?",
                  "Como calcular a indemnização por despedimento colectivo?",
                  "Quais são os direitos em caso de assédio moral?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputText(suggestion)}
                    className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {sendMutation.isPending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="max-w-[80%] rounded-lg border border-slate-200 bg-white px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-slate-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva a sua pergunta jurídica... (Enter para enviar, Shift+Enter para nova linha)"
              className="min-h-[44px] max-h-[200px] resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || sendMutation.isPending}
              size="icon"
              className="shrink-0"
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            As respostas baseiam-se no Código do Trabalho (Lei n.º 7/2009) e
            legislação complementar. Não substituem aconselhamento jurídico profissional.
          </p>
        </div>
      </div>
    </div>
  );
}
