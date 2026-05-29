import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Entrar — Doutor Trabalho" }] }),
});

function Login() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="relative px-6 pb-24 pt-36">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[var(--color-beige-deep)] opacity-60 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--color-coffee)] text-[var(--color-cream)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="font-serif text-3xl">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Entra na tua conta Doutor Trabalho
              </p>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Field label="Email" type="email" placeholder="o.teu@email.pt" />
              <Field label="Palavra-passe" type="password" placeholder="••••••••" />
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-[var(--color-border)]" />
                  Lembrar-me
                </label>
                <a href="#" className="text-[var(--color-coffee)] underline-offset-4 hover:underline">
                  Esqueci-me
                </a>
              </div>
              <button
                type="submit"
                className="glow-cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-coffee)] px-5 py-3 text-sm font-medium text-[var(--color-cream)]"
              >
                Entrar <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
              <div className="h-px flex-1 bg-[var(--color-border)]" /> ou <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>
            <button className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-cream)] px-5 py-3 text-sm hover:bg-[var(--color-sand)]">
              Continuar com Google
            </button>
            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Ainda não tens conta?{" "}
              <Link to="/signup" className="font-medium text-[var(--color-coffee)] underline-offset-4 hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-stone)] focus:ring-2 focus:ring-[var(--color-beige-deep)]"
      />
    </label>
  );
}
