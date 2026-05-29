import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-sand)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-coffee)] text-[var(--color-cream)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="font-serif text-lg">Doutor Trabalho</div>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              AI Agent de Direito do Trabalho em Portugal
            </div>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-coffee)]/80">
          <a href="/#como-funciona">Como funciona</a>
          <a href="/#planos">Planos</a>
          <a href="/#blog">Blog</a>
          <a href="/#duvidas">Dúvidas</a>
          <Link to="/login">Entrar</Link>
        </nav>
        <div className="text-xs text-[var(--color-muted-foreground)]">
          © {new Date().getFullYear()} Doutor Trabalho. Lisboa, Portugal.
        </div>
      </div>
    </footer>
  );
}
