import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Field } from "./login";
import { auth } from "@/lib/api";
import { saveTokens } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({ meta: [{ title: "Criar conta — Doutor Trabalho" }] }),
});

function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await auth.register(firstName.trim(), lastName.trim(), email.trim(), password, orgName.trim() || undefined);
      // Auto-login after registration
      const tokens = await auth.login(email.trim(), password);
      saveTokens(tokens);
      navigate({ to: "/chat" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
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
              <h1 className="font-serif text-3xl">Cria a tua conta</h1>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Começa grátis. Sem cartão de crédito.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Nome"
                  type="text"
                  placeholder="Maria"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Field
                  label="Apelido"
                  type="text"
                  placeholder="Silva"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
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
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Field
                label="Empresa (opcional)"
                type="text"
                placeholder="Nome da organização"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="glow-cta inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-coffee)] px-5 py-3 text-sm font-medium text-[var(--color-cream)] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "A criar conta…" : "Criar conta"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Já tens conta?{" "}
              <Link to="/login" className="font-medium text-[var(--color-coffee)] underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
