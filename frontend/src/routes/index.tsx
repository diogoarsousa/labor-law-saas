import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Check,
  Clock,
  FileText,
  Gavel,
  MessageCircle,
  Newspaper,
  Quote,
  Scale,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImg from "@/assets/hero.jpg";
import teamImg from "@/assets/team.jpg";
import newsImg from "@/assets/news.jpg";
import story1 from "@/assets/story1.jpg";
import story2 from "@/assets/story2.jpg";
import story3 from "@/assets/story3.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Doutor Trabalho — AI Agent de Direito do Trabalho em Portugal" },
      {
        name: "description",
        content:
          "Doutor Trabalho é o AI Agent que responde às tuas dúvidas de Direito do Trabalho em Portugal em segundos. Atualizado, fiável e acessível 24/7.",
      },
    ],
  }),
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <motion.div {...fadeUp} className="mx-auto mb-14 max-w-2xl text-center">
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-sand)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-stone)]" />
            {eyebrow}
          </div>
        )}
        <h2 className="text-balance font-serif text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
        {subtitle && (
          <p className="mt-4 text-[var(--color-muted-foreground)]">{subtitle}</p>
        )}
      </motion.div>
      {children}
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[var(--color-beige-deep)] opacity-60 blur-3xl" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-[var(--color-beige)] opacity-70 blur-3xl" />
        <div className="absolute inset-0 grain opacity-40" />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-sand)]/80 px-3 py-1 text-xs text-[var(--color-coffee)]/80 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Novo · AI Agent treinado em legislação portuguesa
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-center font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl"
        >
          O teu advogado de <em className="italic">Direito do Trabalho</em>,
          <br className="hidden sm:block" /> sempre disponível.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-center text-lg text-[var(--color-muted-foreground)]"
        >
          Respostas claras e fundamentadas sobre férias, despedimentos, contratos,
          baixas e muito mais. Tudo baseado no Código do Trabalho português.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link
            to="/signup"
            className="group glow-cta inline-flex items-center gap-2 rounded-full bg-[var(--color-coffee)] px-6 py-3 text-sm font-medium text-[var(--color-cream)] transition hover:opacity-95"
          >
            Experimentar grátis
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] px-6 py-3 text-sm font-medium text-[var(--color-coffee)] transition hover:bg-[var(--color-sand)]"
          >
            Ver como funciona
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="glass-strong overflow-hidden rounded-3xl p-2 shadow-[0_30px_80px_-30px_rgba(95,88,78,0.4)]">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={heroImg}
                alt="Profissional a trabalhar com o Doutor Trabalho"
                width={1280}
                height={960}
                className="h-auto w-full"
              />
            </div>
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
            <span>Código do Trabalho</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-stone)]" />
            <span>Jurisprudência atualizada</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-stone)]" />
            <span>Disponível 24/7</span>
            <span className="h-1 w-1 rounded-full bg-[var(--color-stone)]" />
            <span>+10.000 utilizadores</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Bot,
    title: "Pergunta em linguagem natural",
    desc: "Escreve como falas. O Doutor Trabalho entende contexto, datas e cláusulas.",
  },
  {
    icon: Scale,
    title: "Fundamentação legal",
    desc: "Cada resposta com referência ao artigo do Código do Trabalho aplicável.",
  },
  {
    icon: FileText,
    title: "Análise de contratos",
    desc: "Carrega o teu contrato e identifica cláusulas abusivas ou irregulares.",
  },
  {
    icon: Clock,
    title: "Resposta em segundos",
    desc: "Sem esperas, sem marcações. Disponível 24 horas por dia, 7 dias por semana.",
  },
  {
    icon: Shield,
    title: "Confidencial",
    desc: "Os teus dados são tratados com a máxima privacidade e nunca partilhados.",
  },
  {
    icon: Gavel,
    title: "Atualizado ao minuto",
    desc: "Acompanha as últimas alterações legislativas e acórdãos relevantes.",
  },
];

function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Direito do Trabalho ao alcance de uma pergunta."
      subtitle="Construído com a mais recente tecnologia de IA, treinado especificamente em legislação portuguesa."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)] p-7 transition hover:border-[var(--color-stone)]/60 hover:bg-[var(--color-sand)]"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-beige)] opacity-0 blur-2xl transition group-hover:opacity-80" />
            <div className="relative">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-beige-deep)] text-[var(--color-coffee)]">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        {...fadeUp}
        className="mt-16 grid items-center gap-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-sand)] p-6 md:grid-cols-2 md:p-10"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
            Em 3 passos
          </div>
          <h3 className="mt-3 font-serif text-3xl">Da dúvida à decisão.</h3>
          <ol className="mt-6 space-y-5">
            {[
              { n: "01", t: "Conta-nos a tua situação", d: "Descreve o problema como contarias a um amigo." },
              { n: "02", t: "Recebe a resposta fundamentada", d: "Com base no Código do Trabalho e jurisprudência." },
              { n: "03", t: "Age com confiança", d: "Modelos de cartas, próximos passos e referências." },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="font-serif text-2xl text-[var(--color-stone)]">{s.n}</span>
                <div>
                  <div className="font-medium">{s.t}</div>
                  <div className="text-sm text-[var(--color-muted-foreground)]">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <img src={teamImg} alt="Equipa do Doutor Trabalho" width={1280} height={800} loading="lazy" className="h-full w-full object-cover" />
        </div>
      </motion.div>
    </Section>
  );
}

const news = [
  {
    tag: "Legislação",
    date: "15 Mai 2026",
    title: "Nova lei do teletrabalho: o que muda em 2026",
    excerpt: "Atualização ao regime do teletrabalho clarifica direito à desconexão e responsabilidades do empregador.",
  },
  {
    tag: "Acórdão",
    date: "08 Mai 2026",
    title: "Supremo decide sobre justa causa em faltas justificadas",
    excerpt: "Novo entendimento limita o despedimento por faltas acumuladas com justificação médica.",
  },
  {
    tag: "Salário",
    date: "01 Mai 2026",
    title: "Salário mínimo nacional sobe para 920€",
    excerpt: "Aumento entra em vigor já em junho. Vê o impacto nos teus subsídios e contribuições.",
  },
];

function News() {
  return (
    <Section
      id="noticias"
      eyebrow="Últimas notícias"
      title="O que muda no Direito do Trabalho."
      subtitle="A atualidade legislativa portuguesa, resumida e explicada."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {news.map((n, i) => (
          <motion.article
            key={n.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)]"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={newsImg}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                <span className="rounded-full bg-[var(--color-beige)] px-2 py-0.5 text-[var(--color-coffee)]">
                  {n.tag}
                </span>
                <span>{n.date}</span>
              </div>
              <h3 className="font-serif text-xl leading-snug">{n.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{n.excerpt}</p>
              <a
                href="#"
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-coffee)] transition group-hover:gap-2"
              >
                Ler artigo <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

const blog = [
  { tag: "Guia", title: "Tudo sobre férias em 2026", read: "6 min" },
  { tag: "Tutorial", title: "Como calcular a indemnização por despedimento", read: "8 min" },
  { tag: "Direitos", title: "Baixa médica: direitos e deveres do trabalhador", read: "5 min" },
  { tag: "Contratos", title: "10 cláusulas a verificar antes de assinar", read: "7 min" },
];

function Blog() {
  return (
    <Section
      id="blog"
      eyebrow="Blog"
      title="Notícias e recursos recentes."
      subtitle="Guias práticos, opiniões e análises da equipa Doutor Trabalho."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {blog.map((p, i) => (
          <motion.a
            key={p.title}
            href="#"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] p-6 transition hover:bg-[var(--color-sand)]"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-beige-deep)]">
                <BookOpen className="h-5 w-5 text-[var(--color-coffee)]" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                  {p.tag} · {p.read}
                </div>
                <div className="mt-1 font-serif text-lg leading-snug">{p.title}</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-stone)] transition group-hover:translate-x-1 group-hover:text-[var(--color-coffee)]" />
          </motion.a>
        ))}
      </div>
    </Section>
  );
}

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "para sempre",
    description: "Testa o Doutor Trabalho sem compromisso.",
    features: ["5 perguntas por mês", "Respostas fundamentadas", "Acesso ao blog completo"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9,90€",
    period: "/ mês",
    description: "Para quem precisa de respostas frequentes.",
    features: [
      "Perguntas ilimitadas",
      "Análise de contratos",
      "Modelos de cartas e e-mails",
      "Histórico e exportação",
      "Suporte prioritário",
    ],
    cta: "Subscrever Pro",
    highlight: true,
  },
  {
    name: "Empresas",
    price: "Sob consulta",
    period: "",
    description: "Para departamentos de RH e gabinetes.",
    features: [
      "Tudo do plano Pro",
      "Múltiplos utilizadores",
      "Integração com o teu sistema",
      "Conta dedicada",
    ],
    cta: "Falar connosco",
    highlight: false,
  },
];

function Plans() {
  return (
    <Section
      id="planos"
      eyebrow="Planos"
      title="Simples, transparente, ao teu ritmo."
      subtitle="Cancela quando quiseres. Sem fidelizações nem letras pequenas."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              p.highlight
                ? "border-[var(--color-coffee)] bg-[var(--color-coffee)] text-[var(--color-cream)] glow-cta"
                : "border-[var(--color-border)] bg-[var(--color-cream)]"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-beige-deep)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-coffee)]">
                Mais popular
              </span>
            )}
            <div className="font-serif text-2xl">{p.name}</div>
            <p className={`mt-1 text-sm ${p.highlight ? "text-[var(--color-cream)]/70" : "text-[var(--color-muted-foreground)]"}`}>
              {p.description}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-serif text-5xl">{p.price}</span>
              {p.period && (
                <span className={`text-sm ${p.highlight ? "text-[var(--color-cream)]/70" : "text-[var(--color-muted-foreground)]"}`}>
                  {p.period}
                </span>
              )}
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className={`mt-0.5 h-4 w-4 ${p.highlight ? "text-[var(--color-beige-deep)]" : "text-[var(--color-stone)]"}`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
                p.highlight
                  ? "bg-[var(--color-cream)] text-[var(--color-coffee)] hover:opacity-90"
                  : "bg-[var(--color-coffee)] text-[var(--color-cream)] hover:opacity-90"
              }`}
            >
              {p.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const stories = [
  {
    name: "Ana Silva",
    role: "Designer freelancer",
    img: story2,
    quote: "Recebi uma resposta clara sobre o meu contrato em 30 segundos. Poupei dias de pesquisa.",
  },
  {
    name: "João Marques",
    role: "Trabalhador da construção",
    img: story1,
    quote: "Ajudou-me a perceber os meus direitos quando a empresa atrasou os salários.",
  },
  {
    name: "Carlos Pinto",
    role: "Gestor de RH",
    img: story3,
    quote: "Uso diariamente para esclarecer dúvidas dos colaboradores. Indispensável.",
  },
];

function Stories() {
  return (
    <Section
      id="historias"
      eyebrow="Histórias reais"
      title="Quem já confia no Doutor Trabalho."
      subtitle="Trabalhadores e empresas em todo o país encontram aqui respostas."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {stories.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="flex flex-col rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)] p-7"
          >
            <Quote className="h-6 w-6 text-[var(--color-stone)]" />
            <p className="mt-4 flex-1 font-serif text-xl leading-snug">"{s.quote}"</p>
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--color-border)] pt-5">
              <img
                src={s.img}
                alt={s.name}
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-[var(--color-muted-foreground)]">{s.role}</div>
              </div>
              <div className="ml-auto flex">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-3.5 w-3.5 fill-[var(--color-stone)] text-[var(--color-stone)]" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

const stats = [
  { v: "+10.000", l: "Utilizadores ativos" },
  { v: "98%", l: "Precisão jurídica" },
  { v: "<30s", l: "Tempo médio de resposta" },
  { v: "24/7", l: "Disponibilidade" },
];

function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <motion.div
        {...fadeUp}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.l} className="bg-[var(--color-sand)] p-8 text-center">
            <div className="font-serif text-4xl">{s.v}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              {s.l}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

const faqs = [
  {
    q: "O Doutor Trabalho substitui um advogado?",
    a: "Não. O Doutor Trabalho é uma ferramenta de informação jurídica que te ajuda a compreender os teus direitos. Para casos complexos recomendamos sempre a consulta a um advogado.",
  },
  {
    q: "Em que legislação se baseia?",
    a: "Código do Trabalho português, legislação complementar, jurisprudência dos tribunais superiores e doutrina relevante, sempre atualizado.",
  },
  {
    q: "Os meus dados são confidenciais?",
    a: "Sim. As conversas são privadas, encriptadas e nunca utilizadas para treinar modelos públicos.",
  },
  {
    q: "Posso cancelar a subscrição quando quiser?",
    a: "Claro. Sem fidelizações nem penalizações. Cancelas com um clique no teu painel.",
  },
  {
    q: "Funciona em situações de Trabalho Independente / Recibos Verdes?",
    a: "Sim. O Doutor Trabalho cobre regimes especiais incluindo trabalho independente, estágios e contratos atípicos.",
  },
];

function FAQ() {
  return (
    <Section
      id="duvidas"
      eyebrow="Dúvidas"
      title="Perguntas frequentes."
      subtitle="Tudo o que precisas de saber antes de começar."
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-cream)] p-2 sm:p-4">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-[var(--color-border)] px-4 last:border-b-0">
              <AccordionTrigger className="text-left font-serif text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="text-[var(--color-muted-foreground)]">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-32">
      <motion.div
        {...fadeUp}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-coffee)] px-8 py-20 text-center text-[var(--color-cream)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[var(--color-beige-deep)] opacity-30 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-[300px] w-[300px] rounded-full bg-[var(--color-stone)] opacity-40 blur-3xl" />
        </div>
        <div className="relative">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[var(--color-cream)]/20 bg-[var(--color-cream)]/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Pronto a começar?
          </div>
          <h2 className="text-balance font-serif text-4xl leading-tight sm:text-5xl">
            Os teus direitos. As tuas respostas.
            <br /> Em segundos.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-cream)]/70">
            Junta-te a milhares de portugueses que já têm o Doutor Trabalho do seu lado.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="glow-cta inline-flex items-center gap-2 rounded-full bg-[var(--color-cream)] px-6 py-3 text-sm font-medium text-[var(--color-coffee)]"
            >
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#planos"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-cream)]/30 px-6 py-3 text-sm font-medium text-[var(--color-cream)] hover:bg-[var(--color-cream)]/10"
            >
              Ver planos
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Stats />
        <News />
        <Blog />
        <Plans />
        <Stories />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
