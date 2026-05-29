import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Briefcase,
  UserX,
  BookOpen,
  ScrollText,
  Mail,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Gerador de Documentos · Doutor Trabalho" },
      {
        name: "description",
        content:
          "Gere contratos de trabalho, cartas de despedimento, regulamentos internos e outros documentos laborais conformes com a lei portuguesa.",
      },
    ],
  }),
  component: DocumentosPage,
});

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type DocType = {
  id: string;
  title: string;
  desc: string;
  icon: typeof Briefcase;
  fields: FieldDef[];
  buildPrompt: (data: Record<string, string>) => string;
};

const DOCUMENTS: DocType[] = [
  {
    id: "contrato-termo-incerto",
    title: "Contrato de Trabalho sem termo",
    desc: "Contrato de trabalho por tempo indeterminado.",
    icon: Briefcase,
    fields: [
      { name: "empregador", label: "Nome do empregador", required: true },
      { name: "nipc", label: "NIPC do empregador" },
      { name: "sedeEmp", label: "Sede do empregador" },
      { name: "trabalhador", label: "Nome do trabalhador", required: true },
      { name: "nifTrab", label: "NIF do trabalhador" },
      { name: "moradaTrab", label: "Morada do trabalhador" },
      { name: "funcao", label: "Categoria / funções", required: true },
      { name: "localTrabalho", label: "Local de trabalho" },
      { name: "salario", label: "Retribuição base mensal (€)", type: "number", required: true },
      { name: "horario", label: "Horário semanal (h)", type: "number", placeholder: "40" },
      { name: "inicio", label: "Data de início", type: "date", required: true },
      { name: "periodoExp", label: "Período experimental (dias)", type: "number", placeholder: "90" },
    ],
    buildPrompt: (d) =>
      `Redige um CONTRATO DE TRABALHO POR TEMPO INDETERMINADO completo e juridicamente correcto, conforme o Código do Trabalho português (Lei n.º 7/2009).
Estrutura em cláusulas numeradas. Inclui identificação das partes, funções, local, horário, retribuição, período experimental, férias, confidencialidade, foro competente e duas assinaturas.

Dados:
- Empregador: ${d.empregador} (NIPC ${d.nipc || "[NIPC]"}, sede em ${d.sedeEmp || "[sede]"})
- Trabalhador: ${d.trabalhador} (NIF ${d.nifTrab || "[NIF]"}, residente em ${d.moradaTrab || "[morada]"})
- Funções: ${d.funcao}
- Local de trabalho: ${d.localTrabalho || "[local]"}
- Retribuição base: ${d.salario} € mensais (×14 meses)
- Horário: ${d.horario || "40"} horas semanais
- Data de início: ${d.inicio}
- Período experimental: ${d.periodoExp || "90"} dias`,
  },
  {
    id: "contrato-termo",
    title: "Contrato de Trabalho a termo certo",
    desc: "Contrato a termo certo com motivo justificativo.",
    icon: ScrollText,
    fields: [
      { name: "empregador", label: "Nome do empregador", required: true },
      { name: "trabalhador", label: "Nome do trabalhador", required: true },
      { name: "funcao", label: "Categoria / funções", required: true },
      { name: "salario", label: "Retribuição base mensal (€)", type: "number", required: true },
      { name: "inicio", label: "Data de início", type: "date", required: true },
      { name: "fim", label: "Data de fim", type: "date", required: true },
      {
        name: "motivo",
        label: "Motivo justificativo",
        type: "textarea",
        required: true,
        placeholder: "Ex.: acréscimo excepcional de actividade no projecto X...",
      },
    ],
    buildPrompt: (d) =>
      `Redige um CONTRATO DE TRABALHO A TERMO CERTO conforme art. 140.º e seguintes do Código do Trabalho português.
Inclui obrigatoriamente o MOTIVO JUSTIFICATIVO concreto e detalhado, prazo certo, possibilidade de renovação, e demais cláusulas usuais.

Dados:
- Empregador: ${d.empregador}
- Trabalhador: ${d.trabalhador}
- Funções: ${d.funcao}
- Retribuição: ${d.salario} €
- Início: ${d.inicio}
- Fim: ${d.fim}
- Motivo justificativo: ${d.motivo}`,
  },
  {
    id: "carta-despedimento-justa",
    title: "Despedimento com Justa Causa",
    desc: "Carta de despedimento por justa causa do empregador.",
    icon: UserX,
    fields: [
      { name: "empregador", label: "Empregador", required: true },
      { name: "trabalhador", label: "Trabalhador", required: true },
      { name: "funcao", label: "Categoria do trabalhador" },
      { name: "factos", label: "Factos imputados", type: "textarea", required: true },
      { name: "data", label: "Data da decisão", type: "date", required: true },
    ],
    buildPrompt: (d) =>
      `Redige uma DECISÃO DE DESPEDIMENTO COM JUSTA CAUSA (após procedimento disciplinar) conforme arts. 351.º a 358.º do Código do Trabalho.
Inclui referências aos factos, conclusões, ponderação da sanção, cessação imediata e indicação de meios de impugnação judicial.

Dados:
- Empregador: ${d.empregador}
- Trabalhador: ${d.trabalhador} (${d.funcao || "trabalhador"})
- Factos: ${d.factos}
- Data da decisão: ${d.data}`,
  },
  {
    id: "carta-resolucao-trabalhador",
    title: "Resolução pelo Trabalhador",
    desc: "Carta de resolução do contrato com justa causa pelo trabalhador.",
    icon: Mail,
    fields: [
      { name: "trabalhador", label: "Nome do trabalhador", required: true },
      { name: "empregador", label: "Nome do empregador", required: true },
      { name: "motivos", label: "Motivos invocados", type: "textarea", required: true },
      { name: "data", label: "Data", type: "date", required: true },
    ],
    buildPrompt: (d) =>
      `Redige uma CARTA DE RESOLUÇÃO DO CONTRATO DE TRABALHO COM JUSTA CAUSA PELO TRABALHADOR (art. 394.º CT), invocando os factos com clareza e exigindo indemnização nos termos do art. 396.º CT.

Dados:
- Trabalhador: ${d.trabalhador}
- Empregador: ${d.empregador}
- Motivos: ${d.motivos}
- Data: ${d.data}`,
  },
  {
    id: "denuncia-trabalhador",
    title: "Denúncia pelo Trabalhador (saída)",
    desc: "Carta de denúncia do contrato com aviso prévio.",
    icon: Mail,
    fields: [
      { name: "trabalhador", label: "Nome do trabalhador", required: true },
      { name: "empregador", label: "Nome do empregador", required: true },
      { name: "antiguidadeAnos", label: "Anos de antiguidade", type: "number" },
      { name: "ultimoDia", label: "Último dia de trabalho", type: "date", required: true },
    ],
    buildPrompt: (d) =>
      `Redige uma CARTA DE DENÚNCIA DO CONTRATO DE TRABALHO PELO TRABALHADOR com respeito pelo aviso prévio do art. 400.º CT.

Dados:
- Trabalhador: ${d.trabalhador}
- Empregador: ${d.empregador}
- Antiguidade: ${d.antiguidadeAnos || "?"} anos
- Último dia: ${d.ultimoDia}`,
  },
  {
    id: "regulamento-interno",
    title: "Regulamento Interno",
    desc: "Regulamento interno da empresa.",
    icon: BookOpen,
    fields: [
      { name: "empresa", label: "Nome da empresa", required: true },
      { name: "sector", label: "Sector de actividade" },
      { name: "horario", label: "Horário base", placeholder: "9h-18h" },
      { name: "particulares", label: "Regras particulares", type: "textarea" },
    ],
    buildPrompt: (d) =>
      `Redige um REGULAMENTO INTERNO completo nos termos do art. 99.º CT, com capítulos para: âmbito, horário e tempos de trabalho, deveres do trabalhador, segurança e saúde, igualdade e não discriminação, protecção de dados (RGPD), uso de equipamentos, procedimento disciplinar, comunicações electrónicas, denúncias internas (Lei 93/2021) e entrada em vigor.

Empresa: ${d.empresa} (${d.sector || "sector"}). Horário: ${d.horario || "a definir"}.
Regras particulares: ${d.particulares || "n/a"}.`,
  },
  {
    id: "recibo-quitacao",
    title: "Recibo de Quitação",
    desc: "Recibo de quitação final.",
    icon: ShieldCheck,
    fields: [
      { name: "trabalhador", label: "Trabalhador", required: true },
      { name: "empregador", label: "Empregador", required: true },
      { name: "valor", label: "Valor total recebido (€)", type: "number", required: true },
      { name: "discriminacao", label: "Discriminação das verbas", type: "textarea", required: true },
      { name: "data", label: "Data", type: "date", required: true },
    ],
    buildPrompt: (d) =>
      `Redige um RECIBO DE QUITAÇÃO conforme art. 358.º e jurisprudência aplicável, identificando as partes, a discriminação detalhada das verbas, o valor total e fórmula de quitação geral.

Dados:
- Trabalhador: ${d.trabalhador}
- Empregador: ${d.empregador}
- Valor total: ${d.valor} €
- Discriminação: ${d.discriminacao}
- Data: ${d.data}`,
  },
];

function DocumentosPage() {
  const [activeId, setActiveId] = useState(DOCUMENTS[0].id);
  const active = DOCUMENTS.find((d) => d.id === activeId)!;
  const [data, setData] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function switchDoc(id: string) {
    setActiveId(id);
    setData({});
    setOutput("");
    setError(null);
  }

  function update(name: string, v: string) {
    setData((d) => ({ ...d, [name]: v }));
  }

  async function generate() {
    setError(null);
    setOutput("");
    const missing = active.fields.filter((f) => f.required && !data[f.name]?.trim());
    if (missing.length) {
      setError(`Preencha: ${missing.map((m) => m.label).join(", ")}`);
      return;
    }
    setLoading(true);
    try {
      const prompt = `${active.buildPrompt(data)}\n\nDevolve apenas o documento em markdown, sem comentários.`;
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "google/gemini-3-flash-preview",
        }),
      });
      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({ error: "Erro no servidor" }));
        throw new Error(j.error || "Erro desconhecido");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              setOutput(acc);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function copyOut() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <header className="border-b border-[var(--color-beige-deep)] bg-[var(--color-sand)]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/chat"
            className="flex items-center gap-2 text-sm text-[var(--color-coffee)]/80 transition hover:text-[var(--color-coffee)]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Chat
          </Link>
          <Link
            to="/simuladores"
            className="hidden items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-1.5 text-xs text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40 sm:inline-flex"
          >
            <Calculator className="h-3.5 w-3.5" /> Simuladores
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-sand)] px-3 py-1 text-xs text-[var(--color-coffee)]/80">
            <FileText className="h-3.5 w-3.5" /> Gerador de Documentos
          </span>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[var(--color-coffee)] sm:text-5xl">
            Documentos prontos em segundos.
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--color-coffee)]/70">
            Contratos, cartas, regulamentos e mais — gerados por IA com base no Código do Trabalho
            português. Revise sempre com um profissional antes de assinar.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ul className="grid gap-2">
            {DOCUMENTS.map((d) => {
              const Icon = d.icon;
              const isActive = d.id === activeId;
              return (
                <li key={d.id}>
                  <button
                    onClick={() => switchDoc(d.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                      isActive
                        ? "border-[var(--color-coffee)] bg-[var(--color-coffee)] text-[var(--color-cream)]"
                        : "border-[var(--color-beige-deep)] bg-[var(--color-sand)] text-[var(--color-coffee)] hover:bg-[var(--color-beige)]/40"
                    }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                        isActive ? "bg-[var(--color-cream)]/15" : "bg-[var(--color-beige-deep)]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{d.title}</span>
                      <span
                        className={`mt-0.5 block text-xs ${
                          isActive ? "text-[var(--color-cream)]/70" : "text-[var(--color-coffee)]/60"
                        }`}
                      >
                        {d.desc}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-[var(--color-beige-deep)] bg-[var(--color-sand)] p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-[var(--color-coffee)]">{active.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-coffee)]/70">{active.desc}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {active.fields.map((f) => (
                <label key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <span className="block text-sm font-medium text-[var(--color-coffee)]">
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </span>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.placeholder}
                      value={data[f.name] ?? ""}
                      onChange={(e) => update(f.name, e.target.value)}
                      className="mt-1 w-full resize-y rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-coffee)] outline-none focus:ring-2 focus:ring-[var(--color-stone)]"
                    />
                  ) : f.type === "select" ? (
                    <select
                      value={data[f.name] ?? ""}
                      onChange={(e) => update(f.name, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-coffee)] outline-none focus:ring-2 focus:ring-[var(--color-stone)]"
                    >
                      <option value="">—</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      placeholder={f.placeholder}
                      value={data[f.name] ?? ""}
                      onChange={(e) => update(f.name, e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-coffee)] outline-none focus:ring-2 focus:ring-[var(--color-stone)]"
                    />
                  )}
                </label>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={generate}
                disabled={loading}
                className="glow-cta inline-flex items-center gap-2 rounded-2xl bg-[var(--color-coffee)] px-5 py-2.5 text-sm font-medium text-[var(--color-cream)] transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? "A gerar..." : "Gerar documento"}
              </button>
              {output && !loading && (
                <>
                  <button
                    onClick={copyOut}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button
                    onClick={download}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40"
                  >
                    <Download className="h-4 w-4" /> Descarregar (.md)
                  </button>
                </>
              )}
            </div>
          </div>

          {(output || loading) && (
            <div className="rounded-3xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] p-6 sm:p-8">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-coffee)]/60">
                <FileText className="h-3.5 w-3.5" /> Pré-visualização
              </div>
              <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-[var(--color-coffee)] prose-p:text-[var(--color-coffee)]/90 prose-strong:text-[var(--color-coffee)] prose-li:text-[var(--color-coffee)]/90">
                {output ? (
                  <ReactMarkdown>{output}</ReactMarkdown>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--color-coffee)]/60" />
                )}
              </div>
              <p className="mt-6 border-t border-[var(--color-beige-deep)] pt-4 text-xs text-[var(--color-coffee)]/50">
                Documento gerado por IA. Revise sempre com um advogado antes de utilizar.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
