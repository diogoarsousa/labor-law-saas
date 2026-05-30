import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { auth } from "@/lib/api";
import { saveTokens } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Entrar — Doutor Trabalho" }] }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await auth.login(email.trim(), password);
      saveTokens(tokens);
      navigate({ to: "/chat" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

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

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Email"
                type="email"
                placeholder="o.teu@email.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Field
                label="Palavra-passe"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="glow-cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-coffee)] px-5 py-3 text-sm font-medium text-[var(--color-cream)] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "A entrar…" : "Entrar"}
              </button>
            </form>

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

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
