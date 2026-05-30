import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Sparkles,
  Loader2,
  Scale,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Pencil,
  Check,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Calculator,
  FileSignature,
  LogOut,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { legalQa, type CitationDto } from "@/lib/api";
import { isAuthenticated, clearTokens, getRefreshToken } from "@/lib/auth";
import { auth } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────

type Msg = {
  role: "user" | "assistant";
  content: string;
  citations?: CitationDto[];
};

type Conversation = {
  id: string;            // backend session UUID (also used as local key)
  title: string;
  messages: Msg[];
  createdAt: number;
  updatedAt: number;
  messagesLoaded: boolean;
};

type Settings = {
  theme: "light" | "sepia";
  fontSize: "sm" | "base" | "lg";
};

// ── Constants ─────────────────────────────────────────────────────────────────

const SETTINGS_KEY = "dt_chat_settings_v1";

const SUGGESTIONS = [
  { icon: Scale,       title: "Despedimento sem justa causa",  prompt: "Fui despedido sem justa causa. Quais os meus direitos e que indemnização posso receber?" },
  { icon: Clock,       title: "Horas extra e descanso",        prompt: "Como são calculadas as horas extraordinárias e o trabalho ao fim-de-semana?" },
  { icon: FileText,    title: "Contrato a termo",              prompt: "Quais as regras e limites para contratos de trabalho a termo certo em Portugal?" },
  { icon: AlertCircle, title: "Assédio no trabalho",           prompt: "O que posso fazer se estou a ser vítima de assédio moral no local de trabalho?" },
];

const DEFAULT_SETTINGS: Settings = { theme: "light", fontSize: "base" };

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/chat")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      { title: "Chat AI · Doutor Trabalho" },
      { name: "description", content: "Faça perguntas sobre Direito do Trabalho em Portugal ao Doutor Trabalho AI." },
    ],
  }),
  component: ChatPage,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function formatCitations(citations: CitationDto[]): string {
  if (!citations?.length) return "";
  const items = citations
    .map((c) => `**${c.lawNumber}${c.article ? `, art. ${c.article}` : ""}**${c.articleText ? ` — ${c.articleText.slice(0, 120)}…` : ""}`)
    .join("\n- ");
  return `\n\n---\n\n**Referências legais:**\n- ${items}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

function ChatPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions from backend on mount
  useEffect(() => {
    setSettings(loadSettings());
    legalQa.listSessions()
      .then((sessions) => {
        setConversations(
          sessions.map((s) => ({
            id: s.id,
            title: s.title || "Sem título",
            messages: [],
            createdAt: new Date(s.createdAt).getTime(),
            updatedAt: new Date(s.updatedAt).getTime(),
            messagesLoaded: false,
          }))
        );
      })
      .catch(() => { /* backend offline — start with empty list */ })
      .finally(() => setSessionsLoading(false));
  }, []);

  // Persist settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversations, activeId, loading]);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);
  const messages = active?.messages ?? [];
  const hasMessages = messages.length > 0;

  // When a session is selected, lazy-load its messages from backend
  async function selectSession(id: string) {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    if (!conv || conv.messagesLoaded) return;
    try {
      const session = await legalQa.getSession(id);
      const msgs: Msg[] = (session.exchanges ?? []).flatMap((ex) => [
        { role: "user" as const, content: ex.question },
        {
          role: "assistant" as const,
          content: ex.answer + formatCitations(ex.citations ?? []),
          citations: ex.citations ?? [],
        },
      ]);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, messages: msgs, messagesLoaded: true } : c))
      );
    } catch { /* non-critical — show empty */ }
  }

  function newConversation() {
    setActiveId(null);
    setInput("");
    setError(null);
  }

  async function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    legalQa.deleteSession(id).catch(() => {}); // best-effort
  }

  async function renameConversation(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)));
    legalQa.renameSession(id, trimmed).catch(() => {}); // best-effort
  }

  async function handleLogout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) auth.logout(refreshToken).catch(() => {});
    clearTokens();
    navigate({ to: "/" });
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    setInput("");
    setLoading(true);

    // Optimistically add user message (or create a temporary local conversation)
    const isNew = !activeId;
    let localId = activeId ?? `tmp-${Date.now()}`;

    if (isNew) {
      const tempConv: Conversation = {
        id: localId,
        title: content.slice(0, 48) + (content.length > 48 ? "…" : ""),
        messages: [{ role: "user", content }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messagesLoaded: true,
      };
      setConversations((prev) => [tempConv, ...prev]);
      setActiveId(localId);
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === localId
            ? { ...c, messages: [...c.messages, { role: "user", content }], updatedAt: Date.now() }
            : c
        )
      );
    }

    // Placeholder for assistant response
    setConversations((prev) =>
      prev.map((c) =>
        c.id === localId
          ? { ...c, messages: [...c.messages, { role: "assistant", content: "" }] }
          : c
      )
    );

    try {
      const sessionId = isNew ? null : activeId;
      const response = await legalQa.ask(sessionId, content);
      const backendId = response.sessionId;
      const fullAnswer = response.answer + formatCitations(response.citations ?? []);

      // Typewriter animation
      for (let i = 4; i <= fullAnswer.length; i += 4) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== localId) return c;
            const msgs = c.messages.slice();
            msgs[msgs.length - 1] = { role: "assistant", content: fullAnswer.slice(0, i) };
            return { ...c, messages: msgs };
          })
        );
        await new Promise((r) => setTimeout(r, 12));
      }

      // Finalise: rename temp ID to backend session ID, set full answer
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== localId) return c;
          const msgs = c.messages.slice();
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: fullAnswer,
            citations: response.citations ?? [],
          };
          return {
            ...c,
            id: backendId,
            messages: msgs,
            messagesLoaded: true,
            updatedAt: Date.now(),
          };
        })
      );
      if (isNew) setActiveId(backendId);

    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      // Remove empty placeholder
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== localId) return c;
          const last = c.messages[c.messages.length - 1];
          if (last?.role === "assistant" && last.content === "") {
            return { ...c, messages: c.messages.slice(0, -1) };
          }
          return c;
        })
      );
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const bgClass = settings.theme === "sepia" ? "bg-[var(--color-sand)]" : "bg-[var(--color-cream)]";
  const fontClass =
    settings.fontSize === "sm" ? "text-sm" :
    settings.fontSize === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base";

  return (
    <div className={`flex h-screen w-full overflow-hidden ${bgClass}`}>
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative z-20 flex h-full w-72 shrink-0 flex-col border-r border-[var(--color-beige-deep)] bg-[var(--color-sand)]/80 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-3">
              <Link
                to="/"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/60"
                aria-label="Voltar ao site"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-serif text-lg leading-none">Doutor Trabalho</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-coffee)]/70 transition hover:bg-[var(--color-beige)]/60"
                aria-label="Fechar sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            <div className="px-3">
              <button
                onClick={newConversation}
                className="flex w-full items-center gap-2 rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-2.5 text-sm font-medium text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40"
              >
                <Plus className="h-4 w-4" /> Nova conversa
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 px-3">
              <Link
                to="/simuladores"
                className="flex items-center gap-1.5 rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-2.5 py-2 text-xs font-medium text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40"
              >
                <Calculator className="h-3.5 w-3.5" /> Simuladores
              </Link>
              <Link
                to="/documentos"
                className="flex items-center gap-1.5 rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-2.5 py-2 text-xs font-medium text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40"
              >
                <FileSignature className="h-3.5 w-3.5" /> Documentos
              </Link>
            </div>

            <div className="mt-4 px-3 text-xs font-medium uppercase tracking-wider text-[var(--color-coffee)]/50">
              Histórico
            </div>
            <div className="mt-2 flex-1 overflow-y-auto px-2 pb-2">
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-coffee)]/40" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="px-3 py-6 text-xs text-[var(--color-coffee)]/50">
                  Ainda sem conversas. Comece já.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {conversations
                    .slice()
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((c) => {
                      const isActive = c.id === activeId;
                      const isEditing = editingId === c.id;
                      return (
                        <li key={c.id}>
                          <div
                            className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition ${
                              isActive
                                ? "bg-[var(--color-beige)]/70 text-[var(--color-coffee)]"
                                : "text-[var(--color-coffee)]/80 hover:bg-[var(--color-beige)]/40"
                            }`}
                          >
                            <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            {isEditing ? (
                              <>
                                <input
                                  autoFocus
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") { renameConversation(c.id, editingTitle); setEditingId(null); }
                                    else if (e.key === "Escape") setEditingId(null);
                                  }}
                                  className="min-w-0 flex-1 rounded bg-[var(--color-cream)] px-1.5 py-0.5 text-sm outline-none ring-1 ring-[var(--color-beige-deep)]"
                                />
                                <button onClick={() => { renameConversation(c.id, editingTitle); setEditingId(null); }} className="grid h-6 w-6 place-items-center rounded text-[var(--color-coffee)]/70 hover:bg-[var(--color-beige)]"><Check className="h-3.5 w-3.5" /></button>
                                <button onClick={() => setEditingId(null)} className="grid h-6 w-6 place-items-center rounded text-[var(--color-coffee)]/70 hover:bg-[var(--color-beige)]"><X className="h-3.5 w-3.5" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => selectSession(c.id)} className="min-w-0 flex-1 truncate text-left text-sm">{c.title}</button>
                                <div className="flex items-center opacity-0 transition group-hover:opacity-100">
                                  <button onClick={() => { setEditingId(c.id); setEditingTitle(c.title); }} className="grid h-6 w-6 place-items-center rounded text-[var(--color-coffee)]/60 hover:bg-[var(--color-beige)]" aria-label="Renomear"><Pencil className="h-3 w-3" /></button>
                                  <button onClick={() => deleteConversation(c.id)} className="grid h-6 w-6 place-items-center rounded text-[var(--color-coffee)]/60 hover:bg-destructive/10 hover:text-destructive" aria-label="Apagar"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--color-beige-deep)] p-3 space-y-1">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/50"
              >
                <SettingsIcon className="h-4 w-4" /> Definições
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--color-coffee)]/70 transition hover:bg-[var(--color-beige)]/50"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="relative flex h-full min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-coffee)]/70 transition hover:bg-[var(--color-beige)]/60" aria-label="Abrir sidebar">
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-cream)]/70 px-3 py-1 text-xs text-[var(--color-coffee)]/80">
              <Sparkles className="h-3 w-3" />
              Doutor Trabalho AI
            </div>
          </div>
          <button onClick={newConversation} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-coffee)]/70 transition hover:bg-[var(--color-beige)]/60 sm:hidden" aria-label="Nova conversa">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Messages / Empty state */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center"
            >
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-cream)]/70 px-3 py-1 text-xs text-[var(--color-coffee)]/80">
                <Sparkles className="h-3.5 w-3.5" /> Doutor Trabalho AI
              </span>
              <h1 className="font-serif text-4xl tracking-tight text-[var(--color-coffee)] sm:text-5xl">
                Como posso ajudá-lo hoje?
              </h1>
              <p className="mt-3 max-w-xl text-[var(--color-coffee)]/70">
                Pergunte qualquer coisa sobre Direito do Trabalho em Portugal. Respostas claras, com base no Código do Trabalho.
              </p>
              <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => send(s.prompt)}
                    className="group flex items-start gap-3 rounded-2xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)]/70 p-4 text-left transition hover:bg-[var(--color-beige)]/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-beige-deep)] text-[var(--color-coffee)]">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-coffee)]">{s.title}</div>
                      <div className="mt-0.5 text-xs text-[var(--color-coffee)]/60">{s.prompt}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 pb-40 sm:px-6">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-coffee)] text-[var(--color-cream)]">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${fontClass} ${
                        m.role === "user"
                          ? "bg-[var(--color-coffee)] text-[var(--color-cream)]"
                          : "border border-[var(--color-beige-deep)] bg-[var(--color-cream)]/80 text-[var(--color-coffee)]"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-[var(--color-coffee)] prose-p:text-[var(--color-coffee)]/90 prose-strong:text-[var(--color-coffee)] prose-li:text-[var(--color-coffee)]/90 prose-a:text-[var(--color-coffee)]">
                          {m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-4 sm:px-6 sm:pb-6">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            <div className="glass-strong glow-cta flex items-end gap-2 rounded-3xl p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Pergunte ao Doutor Trabalho..."
                className="max-h-40 flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[var(--color-coffee)] outline-none placeholder:text-[var(--color-stone)]"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--color-coffee)] text-[var(--color-cream)] transition hover:opacity-90 disabled:opacity-40"
                aria-label="Enviar"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--color-coffee)]/50">
              Informação geral. Não substitui aconselhamento jurídico individual.
            </p>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-coffee)]/30 p-4 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-beige-deep)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4 text-[var(--color-coffee)]" />
                  <h2 className="font-serif text-xl text-[var(--color-coffee)]">Definições</h2>
                </div>
                <button onClick={() => setSettingsOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-coffee)]/60 transition hover:bg-[var(--color-beige)]/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-6 px-5 py-5">
                <Section label="Tema">
                  <div className="grid grid-cols-2 gap-2">
                    <ThemeOption active={settings.theme === "light"} onClick={() => setSettings((s) => ({ ...s, theme: "light" }))} icon={<Sun className="h-4 w-4" />} label="Claro" />
                    <ThemeOption active={settings.theme === "sepia"} onClick={() => setSettings((s) => ({ ...s, theme: "sepia" }))} icon={<Moon className="h-4 w-4" />} label="Sépia" />
                  </div>
                </Section>
                <Section label="Tamanho do texto">
                  <div className="grid grid-cols-3 gap-2">
                    {(["sm", "base", "lg"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSettings((s) => ({ ...s, fontSize: sz }))}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          settings.fontSize === sz
                            ? "border-[var(--color-coffee)] bg-[var(--color-coffee)] text-[var(--color-cream)]"
                            : "border-[var(--color-beige-deep)] bg-[var(--color-sand)] text-[var(--color-coffee)] hover:bg-[var(--color-beige)]/50"
                        }`}
                      >
                        {sz === "sm" ? "Pequeno" : sz === "base" ? "Médio" : "Grande"}
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-coffee)]/60">{label}</div>
      {children}
    </div>
  );
}

function ThemeOption({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
        active
          ? "border-[var(--color-coffee)] bg-[var(--color-coffee)] text-[var(--color-cream)]"
          : "border-[var(--color-beige-deep)] bg-[var(--color-sand)] text-[var(--color-coffee)] hover:bg-[var(--color-beige)]/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
