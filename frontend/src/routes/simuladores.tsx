import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calculator,
  Wallet,
  Scale,
  Briefcase,
  Clock,
  Plane,
  FileText,
} from "lucide-react";

export const Route = createFileRoute("/simuladores")({
  head: () => ({
    meta: [
      { title: "Simuladores · Doutor Trabalho" },
      {
        name: "description",
        content:
          "Simuladores de Direito do Trabalho em Portugal: salário líquido, indemnização por despedimento, horas extra, subsídio de desemprego e mais.",
      },
    ],
  }),
  component: SimuladoresPage,
});

type SimId = "liquido" | "indemnizacao" | "horas" | "desemprego" | "ferias";

const SIMULATORS: { id: SimId; title: string; desc: string; icon: typeof Wallet }[] = [
  {
    id: "liquido",
    title: "Salário Líquido",
    desc: "Calcule o seu salário líquido mensal (IRS + Segurança Social).",
    icon: Wallet,
  },
  {
    id: "indemnizacao",
    title: "Indemnização por Despedimento",
    desc: "Estime a compensação por cessação do contrato de trabalho.",
    icon: Scale,
  },
  {
    id: "horas",
    title: "Horas Extraordinárias",
    desc: "Calcule o pagamento de trabalho suplementar.",
    icon: Clock,
  },
  {
    id: "desemprego",
    title: "Subsídio de Desemprego",
    desc: "Estime o valor e duração do subsídio.",
    icon: Briefcase,
  },
  {
    id: "ferias",
    title: "Subsídio de Férias Proporcional",
    desc: "Calcule férias, subsídio de férias e de Natal proporcionais.",
    icon: Plane,
  },
];

function SimuladoresPage() {
  const [active, setActive] = useState<SimId>("liquido");
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
            to="/documentos"
            className="hidden items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-1.5 text-xs text-[var(--color-coffee)] transition hover:bg-[var(--color-beige)]/40 sm:inline-flex"
          >
            <FileText className="h-3.5 w-3.5" /> Gerador de Documentos
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-beige-deep)] bg-[var(--color-sand)] px-3 py-1 text-xs text-[var(--color-coffee)]/80">
            <Calculator className="h-3.5 w-3.5" /> Simuladores
          </span>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[var(--color-coffee)] sm:text-5xl">
            Faça as contas, sem dor de cabeça.
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--color-coffee)]/70">
            Ferramentas práticas baseadas no Código do Trabalho e legislação fiscal portuguesa.
            Valores indicativos — não substituem aconselhamento profissional.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar com lista de simuladores */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {SIMULATORS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
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
                      <span className="block text-sm font-medium">{s.title}</span>
                      <span
                        className={`mt-0.5 block text-xs ${
                          isActive ? "text-[var(--color-cream)]/70" : "text-[var(--color-coffee)]/60"
                        }`}
                      >
                        {s.desc}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[var(--color-beige-deep)] bg-[var(--color-sand)] p-6 shadow-sm sm:p-8"
        >
          {active === "liquido" && <LiquidoSim />}
          {active === "indemnizacao" && <IndemnizacaoSim />}
          {active === "horas" && <HorasExtraSim />}
          {active === "desemprego" && <DesempregoSim />}
          {active === "ferias" && <FeriasSim />}
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------ UI helpers ------------------------------ */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-coffee)]">{label}</span>
      {hint && <span className="mb-1 block text-xs text-[var(--color-coffee)]/60">{hint}</span>}
      {children}
    </label>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] px-3 py-2 text-sm text-[var(--color-coffee)] outline-none transition focus:ring-2 focus:ring-[var(--color-stone)]";

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl text-[var(--color-coffee)] sm:text-3xl">{children}</h2>;
}

function Result({
  rows,
  highlight,
}: {
  rows: { label: string; value: string; sub?: string }[];
  highlight?: { label: string; value: string };
}) {
  return (
    <div className="mt-6 space-y-3 rounded-2xl border border-[var(--color-beige-deep)] bg-[var(--color-cream)] p-5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-[var(--color-coffee)]/70">
            {r.label}
            {r.sub && (
              <span className="ml-1 text-xs text-[var(--color-coffee)]/50">{r.sub}</span>
            )}
          </span>
          <span className="font-mono text-sm text-[var(--color-coffee)]">{r.value}</span>
        </div>
      ))}
      {highlight && (
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-[var(--color-beige-deep)] pt-3">
          <span className="text-sm font-semibold text-[var(--color-coffee)]">{highlight.label}</span>
          <span className="font-serif text-2xl text-[var(--color-coffee)]">{highlight.value}</span>
        </div>
      )}
    </div>
  );
}

const eur = (n: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    isFinite(n) ? n : 0,
  );

/* ------------------------ Salário Líquido (2025) ------------------------ */
// Tabelas IRS continente 2025 simplificadas para "Não casado, sem dependentes"
// Aproximação suficiente para simulação informativa.
function irsRate(monthlyGross: number, dependentes: number, casado: boolean): number {
  // Escalões aproximados (mensais) — apenas indicativos
  const brackets: [number, number][] = [
    [870, 0],
    [991, 0.0598],
    [1070, 0.0875],
    [1271, 0.1129],
    [1505, 0.1431],
    [1842, 0.1813],
    [2229, 0.2110],
    [2761, 0.2371],
    [3437, 0.2618],
    [4474, 0.2856],
    [5933, 0.3173],
    [8418, 0.3496],
    [20064, 0.3859],
    [Infinity, 0.4423],
  ];
  let rate = 0;
  for (const [limit, r] of brackets) {
    if (monthlyGross <= limit) {
      rate = r;
      break;
    }
  }
  if (casado) rate = Math.max(0, rate - 0.015);
  rate = Math.max(0, rate - dependentes * 0.012);
  return rate;
}

function LiquidoSim() {
  const [bruto, setBruto] = useState(1200);
  const [casado, setCasado] = useState(false);
  const [umTitular, setUmTitular] = useState(true);
  const [dep, setDep] = useState(0);
  const [subAlim, setSubAlim] = useState(6);
  const [diasUteis, setDiasUteis] = useState(22);

  const ss = bruto * 0.11;
  const irs = bruto * irsRate(bruto, dep, casado && umTitular);
  const liquido = bruto - ss - irs;
  const subAlimMes = subAlim * diasUteis;
  const totalReceber = liquido + subAlimMes;

  return (
    <div>
      <Title>Simulador de Salário Líquido</Title>
      <p className="mt-1 text-sm text-[var(--color-coffee)]/70">
        Cálculo aproximado para trabalhador por conta de outrem (Continente, 2025).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Salário base bruto mensal (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={bruto}
            onChange={(e) => setBruto(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Subsídio de alimentação / dia (€)" hint="Cartão: até 10,20€ isento">
          <input
            type="number"
            min={0}
            step="0.1"
            className={inputClass}
            value={subAlim}
            onChange={(e) => setSubAlim(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Dias úteis no mês">
          <input
            type="number"
            min={0}
            max={31}
            className={inputClass}
            value={diasUteis}
            onChange={(e) => setDiasUteis(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Dependentes">
          <input
            type="number"
            min={0}
            max={10}
            className={inputClass}
            value={dep}
            onChange={(e) => setDep(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Situação fiscal">
          <select
            className={inputClass}
            value={casado ? "casado" : "solteiro"}
            onChange={(e) => setCasado(e.target.value === "casado")}
          >
            <option value="solteiro">Não casado</option>
            <option value="casado">Casado</option>
          </select>
        </Field>
        {casado && (
          <Field label="Titulares de rendimento">
            <select
              className={inputClass}
              value={umTitular ? "1" : "2"}
              onChange={(e) => setUmTitular(e.target.value === "1")}
            >
              <option value="2">Dois titulares</option>
              <option value="1">Único titular</option>
            </select>
          </Field>
        )}
      </div>

      <Result
        rows={[
          { label: "Salário bruto", value: eur(bruto) },
          { label: "Segurança Social", sub: "(11%)", value: `- ${eur(ss)}` },
          { label: "IRS retido (estimado)", value: `- ${eur(irs)}` },
          { label: "Subsídio de alimentação", value: `+ ${eur(subAlimMes)}` },
        ]}
        highlight={{ label: "A receber este mês", value: eur(totalReceber) }}
      />
    </div>
  );
}

/* --------------------- Indemnização por Despedimento --------------------- */
function IndemnizacaoSim() {
  const [salario, setSalario] = useState(1000);
  const [diuturnidades, setDiuturnidades] = useState(0);
  const [anos, setAnos] = useState(3);
  const [meses, setMeses] = useState(0);
  const [motivo, setMotivo] = useState<"coletivo" | "posto" | "inadaptacao" | "termo" | "justa">(
    "coletivo",
  );

  const result = useMemo(() => {
    const rb = salario + diuturnidades;
    const tempo = anos + meses / 12;
    // Limites: máx 240 dias (12x rb) e rb relevante limitado a 20 x RMMG.
    let dias = 0;
    let descricao = "";
    if (motivo === "coletivo" || motivo === "posto" || motivo === "inadaptacao") {
      dias = 14 * tempo; // 14 dias por ano completo (regra geral 2014+)
      descricao = "14 dias de retribuição base + diuturnidades por cada ano completo.";
    } else if (motivo === "termo") {
      dias = 24 * tempo; // contratos a termo: 24 dias / ano
      descricao = "Contrato a termo: 24 dias por cada ano completo.";
    } else if (motivo === "justa") {
      dias = 30 * tempo; // resolução com justa causa: 15 a 45 dias; assumimos 30
      descricao = "Resolução com justa causa: entre 15 e 45 dias por ano (assumido 30).";
    }
    const valor = Math.min((rb / 30) * dias, rb * 12);
    return { rb, valor, descricao };
  }, [salario, diuturnidades, anos, meses, motivo]);

  return (
    <div>
      <Title>Indemnização por Cessação do Contrato</Title>
      <p className="mt-1 text-sm text-[var(--color-coffee)]/70">
        Cálculo segundo o Código do Trabalho (regra aplicável aos contratos celebrados após
        01/10/2013).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Retribuição base mensal (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={salario}
            onChange={(e) => setSalario(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Diuturnidades mensais (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={diuturnidades}
            onChange={(e) => setDiuturnidades(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Anos de antiguidade">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={anos}
            onChange={(e) => setAnos(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Meses adicionais">
          <input
            type="number"
            min={0}
            max={11}
            className={inputClass}
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Motivo da cessação">
          <select
            className={inputClass}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value as typeof motivo)}
          >
            <option value="coletivo">Despedimento coletivo</option>
            <option value="posto">Extinção do posto de trabalho</option>
            <option value="inadaptacao">Inadaptação</option>
            <option value="termo">Caducidade contrato a termo</option>
            <option value="justa">Resolução com justa causa (trabalhador)</option>
          </select>
        </Field>
      </div>

      <Result
        rows={[
          { label: "Retribuição base + diuturnidades", value: eur(result.rb) },
          { label: "Antiguidade", value: `${anos} ano(s) + ${meses} mês(es)` },
          { label: "Regra aplicada", value: result.descricao },
        ]}
        highlight={{ label: "Indemnização estimada", value: eur(result.valor) }}
      />
    </div>
  );
}

/* ------------------------ Horas Extraordinárias ------------------------ */
function HorasExtraSim() {
  const [salario, setSalario] = useState(1000);
  const [horasMes, setHorasMes] = useState(160);
  const [h1, setH1] = useState(0);
  const [hSeg, setHSeg] = useState(0);
  const [hDesc, setHDesc] = useState(0);
  const [hFer, setHFer] = useState(0);

  const valorHora = salario / horasMes;
  const t1 = h1 * valorHora * 1.25;
  const t2 = hSeg * valorHora * 1.375;
  const td = hDesc * valorHora * 1.5;
  const tf = hFer * valorHora * 2;
  const total = t1 + t2 + td + tf;

  return (
    <div>
      <Title>Trabalho Suplementar (Horas Extra)</Title>
      <p className="mt-1 text-sm text-[var(--color-coffee)]/70">
        Acréscimos aplicáveis ao trabalho suplementar (art. 268.º CT, valores em vigor a partir de
        2024).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Retribuição base mensal (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={salario}
            onChange={(e) => setSalario(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Horas de trabalho por mês" hint="Normalmente 160-176">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={horasMes}
            onChange={(e) => setHorasMes(Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Horas em dia útil — 1ª hora (+25%)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={h1}
            onChange={(e) => setH1(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Horas em dia útil — seguintes (+37,5%)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={hSeg}
            onChange={(e) => setHSeg(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Horas em descanso semanal (+50%)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={hDesc}
            onChange={(e) => setHDesc(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Horas em feriado (+100%)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={hFer}
            onChange={(e) => setHFer(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <Result
        rows={[
          { label: "Valor hora", value: eur(valorHora) },
          { label: "1ª hora dia útil", value: eur(t1) },
          { label: "Horas seguintes dia útil", value: eur(t2) },
          { label: "Descanso semanal", value: eur(td) },
          { label: "Feriado", value: eur(tf) },
        ]}
        highlight={{ label: "Total a receber", value: eur(total) }}
      />
    </div>
  );
}

/* -------------------------- Subsídio de Desemprego -------------------------- */
function DesempregoSim() {
  const [remMedia, setRemMedia] = useState(1100);
  const [idade, setIdade] = useState(35);
  const [mesesDescontos, setMesesDescontos] = useState(48);
  const IAS = 522.5; // 2025

  const diaria = Math.min(remMedia * 0.65 * (12 / 365), IAS * 2.5 * (12 / 365));
  const mensal = diaria * 30;
  // duração simplificada
  let duracao = 5;
  if (idade < 30) duracao = mesesDescontos < 24 ? 5 : 9;
  else if (idade < 40) duracao = mesesDescontos < 48 ? 9 : 12;
  else if (idade < 50) duracao = mesesDescontos < 60 ? 12 : 18;
  else duracao = mesesDescontos < 72 ? 18 : 26;

  return (
    <div>
      <Title>Subsídio de Desemprego</Title>
      <p className="mt-1 text-sm text-[var(--color-coffee)]/70">
        Estimativa com base na remuneração média dos últimos 12 meses. Limite máximo: 2,5 × IAS
        ({eur(IAS * 2.5)}).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Remuneração média mensal últimos 12m (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={remMedia}
            onChange={(e) => setRemMedia(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Idade">
          <input
            type="number"
            min={16}
            max={80}
            className={inputClass}
            value={idade}
            onChange={(e) => setIdade(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Meses com descontos nos últimos anos">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={mesesDescontos}
            onChange={(e) => setMesesDescontos(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <Result
        rows={[
          { label: "Valor diário", value: eur(diaria) },
          { label: "Valor mensal estimado", value: eur(mensal) },
          { label: "Duração prevista", value: `${duracao} meses` },
          { label: "Total estimado", value: eur(mensal * duracao) },
        ]}
        highlight={{ label: "Subsídio mensal", value: eur(mensal) }}
      />
    </div>
  );
}

/* ------------------- Férias / Subsídios proporcionais ------------------- */
function FeriasSim() {
  const [salario, setSalario] = useState(1000);
  const [meses, setMeses] = useState(7);

  const propMes = salario / 12;
  const feriasDias = (22 / 12) * meses;
  const subFerias = propMes * meses;
  const subNatal = propMes * meses;
  const propFeriasValor = (salario / 22) * feriasDias;
  const total = subFerias + subNatal + propFeriasValor;

  return (
    <div>
      <Title>Proporcionais de Férias e Subsídios</Title>
      <p className="mt-1 text-sm text-[var(--color-coffee)]/70">
        Cálculo dos proporcionais devidos à cessação do contrato (art. 263.º e 264.º CT).
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Retribuição mensal (€)">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={salario}
            onChange={(e) => setSalario(Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Meses trabalhados este ano">
          <input
            type="number"
            min={0}
            max={12}
            className={inputClass}
            value={meses}
            onChange={(e) => setMeses(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      <Result
        rows={[
          { label: "Férias vencidas (dias)", value: feriasDias.toFixed(1) },
          { label: "Pagamento de férias proporcionais", value: eur(propFeriasValor) },
          { label: "Subsídio de férias proporcional", value: eur(subFerias) },
          { label: "Subsídio de Natal proporcional", value: eur(subNatal) },
        ]}
        highlight={{ label: "Total a receber", value: eur(total) }}
      />
    </div>
  );
}
